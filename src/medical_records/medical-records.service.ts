import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class MedicalRecordsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createRecord(data: {
    patient_id: number;
    doctor_id: number;
    diagnosis: string;
  }) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO medical_records (patient_id, doctor_id, diagnosis) VALUES (?, ?, ?)',
      [data.patient_id, data.doctor_id, data.diagnosis],
    );

    return {
      message: 'Medical record created successfully',
      record_id: result.insertId,
      ...data,
    };
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT 
        m.record_id,
        m.diagnosis,
        m.created_at,
        m.updated_at,
        p.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        d.doctor_id,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
        d.specialization
       FROM medical_records m
       INNER JOIN patients p ON m.patient_id = p.patient_id
       INNER JOIN doctors d ON m.doctor_id = d.doctor_id
       ORDER BY m.created_at DESC`,
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT 
        m.record_id,
        m.diagnosis,
        m.created_at,
        m.updated_at,
        p.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        d.doctor_id,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
        d.specialization
       FROM medical_records m
       INNER JOIN patients p ON m.patient_id = p.patient_id
       INNER JOIN doctors d ON m.doctor_id = d.doctor_id
       WHERE m.record_id = ?`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('Medical record not found');
    return rows[0];
  }

  async updateRecord(
    id: number,
    partial: {
      patient_id?: number;
      doctor_id?: number;
      diagnosis?: string;
    },
  ) {
    const record = await this.findById(id);
    if (!record) throw new NotFoundException('Medical record not found');

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.patient_id) {
      fields.push('patient_id = ?');
      values.push(partial.patient_id);
    }
    if (partial.doctor_id) {
      fields.push('doctor_id = ?');
      values.push(partial.doctor_id);
    }
    if (partial.diagnosis) {
      fields.push('diagnosis = ?');
      values.push(partial.diagnosis);
    }

    if (fields.length === 0) return record;

    values.push(id);
    await this.pool().execute(
      `UPDATE medical_records SET ${fields.join(', ')} WHERE record_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deleteRecord(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM medical_records WHERE record_id = ?',
      [id],
    );
    return res.affectedRows > 0;
  }
}