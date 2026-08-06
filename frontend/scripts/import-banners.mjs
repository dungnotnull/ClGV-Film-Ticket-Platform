import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:4000/api/v1';

async function importBanners() {
  console.log('--- START IMPORTING BANNERS ---');

  // 1. Login to get Admin Token
  console.log('Logging in as Admin...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@clgv.vn', password: 'AdminPassword123!' })
  });

  if (!loginRes.ok) {
    console.error('Login failed! Check if backend is running and credentials are correct.');
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;
  console.log('Login successful! Token acquired.');

  const banners = [
    {
      title: 'Khuyến mãi Thứ Tư Vui Vẻ',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/movies',
      displayOrder: 1,
      status: 'ACTIVE'
    },
    {
      title: 'Đại Tiệc Phim Bom Tấn',
      imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/cinemas',
      displayOrder: 2,
      status: 'ACTIVE'
    },
    {
      title: 'Giảm 50% Cho Học Sinh Sinh Viên',
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/',
      displayOrder: 3,
      status: 'ACTIVE'
    }
  ];

  for (const banner of banners) {
    try {
      const res = await fetch(`${BASE_URL}/admin/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(banner)
      });
      if (res.ok) {
        console.log(`Banner "${banner.title}" imported successfully.`);
      } else {
        const errorText = await res.text();
        console.error(`Failed to import banner "${banner.title}":`, errorText);
      }
    } catch (error) {
      console.error(`Failed to import banner "${banner.title}"`, error);
    }
  }

  console.log('--- DONE IMPORTING BANNERS ---');
}

importBanners();
