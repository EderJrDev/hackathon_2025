// src/appointments/appointments.controller.ts
import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  /** 1) Lista TODOS os médicos da especialidade na cidade do paciente */
  @Get('doctors')
  listDoctorsBySpecialtyCity(
    @Query('specialtyId') specialtyId: string,
    @Query('city') city: string,
  ) {
    return this.service.listDoctorsBySpecialtyCity(specialtyId, city);
  }

  /** 2) Lista disponibilidades do médico (por padrão, próximos 30 dias) */
  @Get('availability/doctor/:doctorId')
  listAvailabilityByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.listAvailabilityByDoctor(
      doctorId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /** 3) Agenda a partir de um availabilityId (deleta a disponibilidade) */
  @Post('from-availability')
  createFromAvailability(
    @Body()
    body: CreateAppointmentDto & { availabilityId: string },
  ) {
    const { availabilityId, doctorId, patientName, patientBirth } = body;
    return this.service.createAppointmentFromAvailability({
      availabilityId,
      doctorId,
      patientName,
      patientBirth: new Date(patientBirth),
    });
  }

  @Get('by-patient')
  getAppointmentsByPatientName(
    @Query('name') name: string,
    @Query('birth') birth: string,
  ) {
    return this.service.getAppointmentsByPatientName(name, new Date(birth));
  }
}
