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

    // Primeiro tenta busca exata
    let doctors = await this.prisma.doctor.findMany({
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

    // Se não encontrou, tenta busca mais flexível (case insensitive)
    if (doctors.length === 0) {
      doctors = await this.prisma.doctor.findMany({
        where: {
          specialtyId: { contains: specialtyId, mode: 'insensitive' },
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

    return doctors;
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
    const generateProtocol = () => {
      const year = new Date().getFullYear();
      const rand = Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, '0');
      return `${year}${rand}`; // Ex: 2025001234
    };

    return this.prisma.$transaction(async (tx) => {
      const avail = await tx.availability.findUnique({
        where: { id: params.availabilityId },
        select: { id: true, doctorId: true, date: true, isActive: true },
      });
      if (!avail || !avail.isActive)
        throw new NotFoundException('AVAILABILITY_NOT_FOUND');
      if (avail.doctorId !== params.doctorId)
        throw new BadRequestException('DOCTOR_MISMATCH');

      let attempt = 0;
      let appt;
      while (attempt < 3) {
        const protocol = generateProtocol();
        try {
          appt = await tx.appointment.create({
            data: {
              doctorId: avail.doctorId,
              patientName: params.patientName,
              patientBirth: params.patientBirth,
              date: avail.date,
              status: AppointmentStatus.CONFIRMED,
              protocol,
            },
            select: { id: true, protocol: true, status: true, date: true },
          });
          break;
        } catch (err: any) {
          // Prisma P2002 unique constraint failed
          if (err.code === 'P2002' && err.meta?.target?.includes('protocol')) {
            attempt += 1;
            if (attempt >= 3) throw err;
          } else {
            throw err;
          }
        }
      }

      if (!appt) throw new Error('FAILED_TO_CREATE_APPOINTMENT');

      await tx.availability.delete({ where: { id: avail.id } });
      return appt;
    });
  }

  async getAppointmentsByPatientName(name: string, birth: Date) {
    if (!name || !birth)
      throw new BadRequestException('name e birth são obrigatórios');

    // Busca por nome (case insensitive, parcial) e data de nascimento exata
    const appts = await this.prisma.appointment.findMany({
      where: {
        patientName: { contains: name, mode: 'insensitive' },
        patientBirth: birth,
        date: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)),
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      orderBy: { date: 'desc' },
      select: {
        protocol: true,
        status: true,
        date: true,
        doctor: {
          select: {
            name: true,
            crm: true,
            city: true,
            specialtyId: true,
          },
        },
      },
    });

    if (appts.length === 0)
      throw new NotFoundException('APPOINTMENTS_NOT_FOUND');
    return appts;
  }
}
