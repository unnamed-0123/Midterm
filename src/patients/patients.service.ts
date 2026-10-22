import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PatientsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createPatient(data: {
    first_name: string;
    last_name: string;
    birth_date: string;
    gender: string;
    phone: string | number;
  }) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO patients (first_name, last_name, birth_date, gender, phone) VALUES (?, ?, ?, ?, ?)',
      [data.first_name, data.last_name, data.birth_date, data.gender, data.phone],
    );

    return {
      message: 'Patient successfully created',
      patient_id: result.insertId,
      ...data,
    };
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT patient_id, first_name, last_name, birth_date, gender, phone FROM patients',
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT patient_id, first_name, last_name, birth_date, gender, phone FROM patients WHERE patient_id = ?',
      [id],
    );
    if (!rows[0]) throw new NotFoundException('Patient not found');
    return rows[0];
  }

  async updatePatient(
    id: number,
    partial: {
      first_name?: string;
      last_name?: string;
      birth_date?: string;
      gender?: string;
      phone?: string | number;
    },
  ) {
    const patient = await this.findById(id);
    if (!patient) throw new NotFoundException('Patient not found');

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
    if (partial.birth_date) {
      fields.push('birth_date = ?');
      values.push(partial.birth_date);
    }
    if (partial.gender) {
      fields.push('gender = ?');
      values.push(partial.gender);
    }
    if (partial.phone) {
      fields.push('phone = ?');
      values.push(partial.phone);
    }

    if (fields.length === 0) return patient;

    values.push(id);
    await this.pool().execute(
      `UPDATE patients SET ${fields.join(', ')} WHERE patient_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deletePatient(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM patients WHERE patient_id = ?',
      [id],
    );
    return res.affectedRows > 0;
  }
}