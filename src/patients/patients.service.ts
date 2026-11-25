import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PatientsService implements OnModuleInit {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async onModuleInit() {
    const queries = [
      'ALTER TABLE patients ADD COLUMN email VARCHAR(150) NULL',
      'ALTER TABLE patients ADD COLUMN address VARCHAR(255) NULL',
      'ALTER TABLE patients MODIFY COLUMN gender VARCHAR(20) NULL DEFAULT "Not specified"',
    ];
    for (const q of queries) {
      try {
        await this.pool().execute(q);
      } catch {
        // Column already exists or already modified
      }
    }
  }

  async createPatient(data: {
    first_name: string;
    last_name: string;
    birth_date: string;
    email?: string;
    phone: string | number;
    address?: string;
    gender?: string;
  }) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO patients (first_name, last_name, birth_date, email, phone, address, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.first_name,
        data.last_name,
        data.birth_date,
        data.email || null,
        data.phone,
        data.address || null,
        data.gender || 'Not specified',
      ],
    );

    return {
      message: 'Patient successfully created',
      patient_id: result.insertId,
      ...data,
    };
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT patient_id, first_name, last_name, birth_date, email, phone, address, gender FROM patients',
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT patient_id, first_name, last_name, birth_date, email, phone, address, gender FROM patients WHERE patient_id = ?',
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
      email?: string;
      phone?: string | number;
      address?: string;
      gender?: string;
    },
  ) {
    const patient = await this.findById(id);
    if (!patient) throw new NotFoundException('Patient not found');

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
    if (partial.birth_date !== undefined) {
      fields.push('birth_date = ?');
      values.push(partial.birth_date);
    }
    if (partial.email !== undefined) {
      fields.push('email = ?');
      values.push(partial.email);
    }
    if (partial.phone !== undefined) {
      fields.push('phone = ?');
      values.push(partial.phone);
    }
    if (partial.address !== undefined) {
      fields.push('address = ?');
      values.push(partial.address);
    }
    if (partial.gender !== undefined) {
      fields.push('gender = ?');
      values.push(partial.gender);
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