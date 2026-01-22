'use server'

import fs from 'fs';
import path from 'path';

export async function checkCVExists(name: string, lastname: string) {
  const documentName = `CV_${lastname.toUpperCase()}_${name.toUpperCase()}.pdf`;
  const filePath = path.join(process.cwd(), 'public', 'CVs', documentName);
  return fs.existsSync(filePath);
}