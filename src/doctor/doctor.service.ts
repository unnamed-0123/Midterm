import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DoctorsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createDoctor(data: {
    first_name: string;
    last_name: string;
    specialty?: string;
    specialization?: string;
    password?: string;
    email: string;
    licence?: string;
    years_of_experience?: number;
  }) {
    const resolvedSpecialty =
      data.specialty || data.specialization || 'General Medicine';
    const rawPassword = data.password || 'Doctor@123';
    const hashed = await bcrypt.hash(rawPassword, 10);
    const licence = data.licence || 'PENDING';
    const years = Number(data.years_of_experience) || 0;

    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO doctors (first_name, last_name, specialty, password, email, licence, years_of_experience) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.first_name,
        data.last_name,
        resolvedSpecialty,
        hashed,
        data.email,
        licence,
        years,
      ],
    );

    return {
      message: 'Doctor successfully created',
      doctor_id: result.insertId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      specialty: resolvedSpecialty,
      licence,
      years_of_experience: years,
    };
  }

  async findByEmail(email: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT doctor_id, first_name, last_name, specialty, email, password, licence, years_of_experience FROM doctors WHERE email = ?',
      [email],
    );
    return rows[0];
  }

  async findById(doctor_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT doctor_id, first_name, last_name, specialty, email, licence, years_of_experience FROM doctors WHERE doctor_id = ?',
      [doctor_id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT doctor_id, first_name, last_name, specialty, email, licence, years_of_experience FROM doctors',
    );
    return rows;
  }

  async updateDoctor(
    doctor_id: number,
    partial: {
      first_name?: string;
      last_name?: string;
      specialty?: string;
      specialization?: string;
      password?: string;
      email?: string;
      licence?: string;
      years_of_experience?: number;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(partial.first_name);
    }
    if (partial.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(partial.last_name);
    }
    const spec = partial.specialty ?? partial.specialization;
    if (spec !== undefined) {
      fields.push('specialty = ?');
      values.push(spec);
    }
    if (partial.email !== undefined) {
      fields.push('email = ?');
      values.push(partial.email);
    }
    if (partial.licence !== undefined) {
      fields.push('licence = ?');
      values.push(partial.licence);
    }
    if (partial.years_of_experience !== undefined) {
      fields.push('years_of_experience = ?');
      values.push(Number(partial.years_of_experience) || 0);
    }
    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (fields.length === 0) return await this.findById(doctor_id);

    values.push(doctor_id);
    await this.pool().execute(
      `UPDATE doctors SET ${fields.join(', ')} WHERE doctor_id = ?`,
      values,
    );
    return this.findById(doctor_id);
  }

  async deleteDoctor(doctor_id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM doctors WHERE doctor_id = ?',
      [doctor_id],
    );
    return res.affectedRows > 0;
  }
}