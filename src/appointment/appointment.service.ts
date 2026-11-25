import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class AppointmentsService implements OnModuleInit {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async onModuleInit() {
    try {
      await this.pool().execute(
        'ALTER TABLE appointments ADD COLUMN patient_id INT NULL AFTER appointment_id',
      );
    } catch {
      // Column already exists, safe to ignore
    }
  }

  async createAppointment(data: {
    patient_id: number;
    doctor_id: number;
    appointment_time: string;
  }) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_time) VALUES (?, ?, ?)',
      [data.patient_id, data.doctor_id, data.appointment_time],
    );

    return {
      message: 'Appointment successfully created',
      appointment_id: result.insertId,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      appointment_time: data.appointment_time,
    };
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT 
        a.appointment_id,
        a.appointment_time,
        a.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        a.doctor_id,
        d.first_name AS doctor_first_name,
        d.last_name AS doctor_last_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.patient_id
       INNER JOIN doctors d ON a.doctor_id = d.doctor_id
       ORDER BY a.appointment_time ASC`,
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT 
        a.appointment_id,
        a.appointment_time,
        a.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        a.doctor_id,
        d.first_name AS doctor_first_name,
        d.last_name AS doctor_last_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.patient_id
       INNER JOIN doctors d ON a.doctor_id = d.doctor_id
       WHERE a.appointment_id = ?`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('Appointment not found');
    return rows[0];
  }

  async updateAppointment(
    id: number,
    partial: {
      patient_id?: number;
      doctor_id?: number;
      appointment_time?: string;
    },
  ) {
    const appointment = await this.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

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
    if (partial.appointment_time) {
      fields.push('appointment_time = ?');
      values.push(partial.appointment_time);
    }

    if (fields.length === 0) return appointment;

    values.push(id);
    await this.pool().execute(
      `UPDATE appointments SET ${fields.join(', ')} WHERE appointment_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deleteAppointment(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM appointments WHERE appointment_id = ?',
      [id],
    );
    return res.affectedRows > 0;
  }
}