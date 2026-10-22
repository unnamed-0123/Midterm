import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PrescriptionsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createPrescription(data: {
    record_id: number;
    medication_name: string;
    dosage: string;
    frequency: string;
  }) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO prescription (record_id, medication_name, dosage, frequency) VALUES (?, ?, ?, ?)',
      [data.record_id, data.medication_name, data.dosage, data.frequency],
    );

    return {
      message: 'Prescription created successfully',
      prescription_id: result.insertId,
      ...data,
    };
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT 
        pr.prescription_id,
        pr.record_id,
        pr.medication_name,
        pr.dosage,
        pr.frequency,
        m.diagnosis,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name
       FROM prescription pr
       INNER JOIN medical_records m ON pr.record_id = m.record_id
       INNER JOIN patients p ON m.patient_id = p.patient_id`,
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT 
        pr.prescription_id,
        pr.record_id,
        pr.medication_name,
        pr.dosage,
        pr.frequency,
        m.diagnosis,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name
       FROM prescription pr
       INNER JOIN medical_records m ON pr.record_id = m.record_id
       INNER JOIN patients p ON m.patient_id = p.patient_id
       WHERE pr.prescription_id = ?`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('Prescription not found');
    return rows[0];
  }

  async updatePrescription(
    id: number,
    partial: {
      record_id?: number;
      medication_name?: string;
      dosage?: string;
      frequency?: string;
    },
  ) {
    const prescription = await this.findById(id);
    if (!prescription) throw new NotFoundException('Prescription not found');

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.record_id) {
      fields.push('record_id = ?');
      values.push(partial.record_id);
    }
    if (partial.medication_name) {
      fields.push('medication_name = ?');
      values.push(partial.medication_name);
    }
    if (partial.dosage) {
      fields.push('dosage = ?');
      values.push(partial.dosage);
    }
    if (partial.frequency) {
      fields.push('frequency = ?');
      values.push(partial.frequency);
    }

    if (fields.length === 0) return prescription;

    values.push(id);
    await this.pool().execute(
      `UPDATE prescription SET ${fields.join(', ')} WHERE prescription_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deletePrescription(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM prescription WHERE prescription_id = ?',
      [id],
    );
    return res.affectedRows > 0;
  }
}