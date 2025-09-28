import { PrismaClient } from '@prisma/client';

// Node.js process types
declare const process: {
  exit: (code?: number) => never;
};

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clean existing data
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.doctor.deleteMany();

  console.log('Cleaned existing data');

  // Create doctors
  const doctors = [
    {
      name: 'Dr. Ana Silva',
      crm: '12345-SP',
      city: 'São Paulo',
      specialtyId: 'cardiologia',
    },
    {
      name: 'Dr. Carlos Oliveira',
      crm: '23456-RJ',
      city: 'Rio de Janeiro',
      specialtyId: 'ortopedia',
    },
    {
      name: 'Dra. Maria Santos',
      crm: '34567-MG',
      city: 'Belo Horizonte',
      specialtyId: 'pediatria',
    },
    {
      name: 'Dr. João Pereira',
      crm: '45678-PR',
      city: 'Curitiba',
      specialtyId: 'neurologia',
    },
    {
      name: 'Dra. Fernanda Costa',
      crm: '56789-RS',
      city: 'Porto Alegre',
      specialtyId: 'ginecologia',
    },
    {
      name: 'Dr. Rafael Lima',
      crm: '67890-SC',
      city: 'Florianópolis',
      specialtyId: 'dermatologia',
    },
    {
      name: 'Dra. Patricia Mendes',
      crm: '78901-BA',
      city: 'Salvador',
      specialtyId: 'oftalmologia',
    },
    {
      name: 'Dr. Eduardo Rocha',
      crm: '89012-CE',
      city: 'Fortaleza',
      specialtyId: 'urologia',
    },
    {
      name: 'Dra. Lucia Martins',
      crm: '90123-PE',
      city: 'Recife',
      specialtyId: 'psiquiatria',
    },
    {
      name: 'Dr. Roberto Alves',
      crm: '01234-GO',
      city: 'Goiânia',
      specialtyId: 'gastroenterologia',
    },
    {
      name: 'Dra. Camila Ferreira',
      crm: '11111-DF',
      city: 'Brasília',
      specialtyId: 'endocrinologia',
    },
    {
      name: 'Dr. Marcos Souza',
      crm: '22222-ES',
      city: 'Vitória',
      specialtyId: 'pneumologia',
    },
  ];

  console.log('Creating doctors...');
  const createdDoctors = [];
  for (const doctor of doctors) {
    const createdDoctor = await prisma.doctor.create({
      data: doctor,
    });
    createdDoctors.push(createdDoctor);
  }
  console.log(`Created ${createdDoctors.length} doctors`);

  // Create availabilities for each doctor
  console.log('Creating availabilities...');
  const availabilities = [];
  const currentDate = new Date();

  for (const doctor of createdDoctors) {
    // Create 5 availability slots for each doctor across the next 30 days
    for (let i = 1; i <= 5; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + i * 6); // Every 6 days
      futureDate.setHours(8 + (i % 8), 0, 0, 0); // Different hours between 8:00 and 15:00

      const availability = await prisma.availability.create({
        data: {
          doctorId: doctor.id,
          date: futureDate,
          isActive: true,
        },
      });
      availabilities.push(availability);
    }
  }
  console.log(`Created ${availabilities.length} availability slots`);

  // Create appointments
  console.log('Creating appointments...');
  const patients = [
    { name: 'Pedro Henrique Silva', birth: new Date('1985-03-15') },
    { name: 'Maria Fernanda Oliveira', birth: new Date('1990-07-22') },
    { name: 'João Carlos Santos', birth: new Date('1978-11-08') },
    { name: 'Ana Beatriz Costa', birth: new Date('1995-01-30') },
    { name: 'Carlos Eduardo Lima', birth: new Date('1982-09-12') },
    { name: 'Lucia Helena Rocha', birth: new Date('1988-05-18') },
    { name: 'Rafael Augusto Mendes', birth: new Date('1975-12-03') },
    { name: 'Patricia Regina Alves', birth: new Date('1993-04-25') },
    { name: 'Eduardo José Martins', birth: new Date('1987-08-14') },
    { name: 'Camila Cristina Ferreira', birth: new Date('1991-10-07') },
    { name: 'Roberto Carlos Souza', birth: new Date('1980-02-28') },
    { name: 'Fernanda Lucia Pereira', birth: new Date('1984-06-11') },
    { name: 'Marcos Antonio Silva', birth: new Date('1979-09-23') },
    { name: 'Sandra Maria Costa', birth: new Date('1986-12-16') },
    { name: 'Antonio Carlos Lima', birth: new Date('1992-03-05') },
  ];

  const appointmentStatuses = [
    'SCHEDULED',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
  ];

  for (let i = 0; i < 15; i++) {
    const randomDoctor =
      createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
    const patient = patients[i];
    const status =
      appointmentStatuses[
        Math.floor(Math.random() * appointmentStatuses.length)
      ];

    // Create appointment date (next 45 days)
    const appointmentDate = new Date(currentDate);
    appointmentDate.setDate(
      currentDate.getDate() + Math.floor(Math.random() * 45) + 1,
    );
    appointmentDate.setHours(8 + Math.floor(Math.random() * 8), 0, 0, 0); // Between 8:00 and 15:00

    const protocol = `${new Date().getFullYear()}${Math.floor(
      Math.random() * 1_000_000,
    )
      .toString()
      .padStart(6, '0')}`;

    await prisma.appointment.create({
      data: {
        doctorId: randomDoctor.id,
        patientName: patient.name,
        patientBirth: patient.birth,
        date: appointmentDate,
        status: status as any,
        protocol,
      },
    });
  }
  console.log('Created 15 appointments');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
