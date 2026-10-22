import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class AppointmentsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createAppointment(data: {
    doctor_id: number;
    appointment_time: string;
  }) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO appointments (doctor_id, appointment_time) VALUES (?, ?)',
      [data.doctor_id, data.appointment_time],
    );

    return {
      message: 'Appointment successfully created',
      appointment_id: result.insertId,
      doctor_id: data.doctor_id,
      appointment_time: data.appointment_time,
    };
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT 
        a.appointment_id,
        a.appointment_time,
        a.doctor_id,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
        d.specialty,
        d.email
       FROM appointments a
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
        a.doctor_id,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
        d.specialty,
        d.email
       FROM appointments a
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
      doctor_id?: number;
      appointment_time?: string;
    },
  ) {
    const appointment = await this.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    const fields: string[] = [];
    const values: any[] = [];

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