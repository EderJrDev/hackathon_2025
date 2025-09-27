// src/appointments/appointments.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDoctorsBySpecialtyCity(specialtyId: string, city: string) {
    if (!specialtyId || !city)
      throw new BadRequestException('specialtyId e city são obrigatórios');

    return this.prisma.doctor.findMany({
      where: {
        specialtyId,
        city: { equals: city, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        crm: true,
        city: true,
        specialtyId: true,
      },
    });
  }

  async listAvailabilityByDoctor(doctorId: string, start?: Date, end?: Date) {
    // Janela padrão de 30 dias a partir de "agora"
    const s = start ?? new Date();
    const e =
      end ??
      new Date(
        s.getFullYear(),
        s.getMonth(),
        s.getDate() + 30,
        s.getHours(),
        s.getMinutes(),
        s.getSeconds(),
        s.getMilliseconds(),
      );

    // IMPORTANTE: Armazenamos DateTime no banco (UTC). A exibição correta
    // (pt-BR, America/Sao_Paulo) é feita na orquestração (toLocaleString com timeZone).
    // Aqui mantemos os Date como UTC “crus”, sem converter para string local.
    return this.prisma.availability.findMany({
      where: { doctorId, isActive: true, date: { gte: s, lt: e } },
      orderBy: { date: 'asc' },
      select: { id: true, date: true },
    });
  }

  async createAppointmentFromAvailability(params: {
    availabilityId: string;
    doctorId: string;
    patientName: string; // **nome limpo** (apenas o nome)
    patientBirth: Date; // **Date** criado a partir de YYYY-MM-DD (ISO) vindo do orquestrador
  }) {
    return this.prisma.$transaction(async (tx) => {
      const avail = await tx.availability.findUnique({
        where: { id: params.availabilityId },
        select: { id: true, doctorId: true, date: true, isActive: true },
      });
      if (!avail || !avail.isActive)
        throw new NotFoundException('AVAILABILITY_NOT_FOUND');
      if (avail.doctorId !== params.doctorId)
        throw new BadRequestException('DOCTOR_MISMATCH');

      const appt = await tx.appointment.create({
        data: {
          doctorId: avail.doctorId,
          patientName: params.patientName, // grava apenas o nome
          patientBirth: params.patientBirth, // Date correto
          date: avail.date, // DateTime do slot (UTC no banco)
          status: AppointmentStatus.CONFIRMED, // conforme fluxo
        },
        select: { id: true, protocol: true, status: true, date: true },
      });

      await tx.availability.delete({ where: { id: avail.id } });
      return appt;
    });
  }
}
