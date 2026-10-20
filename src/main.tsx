import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root')!;

try {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;font-family:system-ui,sans-serif;padding:24px;">
      <div style="text-align:center;max-width:360px;">
        <div style="font-size:48px;margin-bottom:16px;">🐇</div>
        <h2 style="color:#1e293b;font-size:20px;font-weight:700;margin:0 0 8px;">Что-то пошло не так</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 16px;">Не удалось запустить приложение. Попробуйте обновить страницу.</p>
        <button onclick="location.reload()" style="background:#10b981;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;">
          Обновить страницу
        </button>
      </div>
    </div>
  `;
  console.error(err);
}
