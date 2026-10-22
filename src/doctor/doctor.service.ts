import { Injectable, NotFoundException } from '@nestjs/common';
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
    specialty: string;
    password: string;
    email: string;
    licence: string;
    years_of_experience: number;
  }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO doctors (first_name, last_name, specialty, password, email, licence, years_of_experience) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.first_name, data.last_name, data.specialty, hashed, data.email, data.licence, data.years_of_experience],
    );

    return {
      message: 'Doctor successfully created',
      doctor_id: result.insertId,
      email: data.email,
      specialty: data.specialty,
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
      password?: string;
      email?: string;
      licence?: string;
      years_of_experience?: number;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.first_name) {
      fields.push('first_name = ?');
      values.push(partial.first_name);
    }
    if (partial.last_name) {
      fields.push('last_name = ?');
      values.push(partial.last_name);
    }
    if (partial.specialty) {
      fields.push('specialty = ?');
      values.push(partial.specialty);
    }
    if (partial.email) {
      fields.push('email = ?');
      values.push(partial.email);
    }
    if (partial.licence) {
      fields.push('licence = ?');
      values.push(partial.licence);
    }
    if (partial.years_of_experience !== undefined) {
      fields.push('years_of_experience = ?');
      values.push(partial.years_of_experience);
    }
    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (fields.length === 0) return await this.findById(doctor_id);

    values.push(doctor_id);
    await this.pool().execute(
      `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    return this.findById(doctor_id);
  }

  async deleteDoctor(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM doctors WHERE id = ?',
      [id],
    );
    return res.affectedRows > 0;
  }
}