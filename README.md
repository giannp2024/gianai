# Gian AI - Asistente Personal

Un asistente personal inteligente con interfaz minimalista y diseño oscuro.

## Características

- Conversaciones inteligentes con IA (Deepseek)
- Sistema de recordatorios
- Interfaz minimalista oscura
- Configuración personalizable
- Envío de emails
- Simulación de comandos de voz

## Instalación Local

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura variables de entorno
4. Ejecuta en desarrollo: `npm run dev`

## Variables de Entorno

- `OPENAI_API_KEY`: Clave API de OpenRouter para Deepseek
- `SMTP_HOST`: Servidor SMTP para emails (opcional)
- `SMTP_USER`: Usuario SMTP (opcional)
- `SMTP_PASS`: Contraseña SMTP (opcional)

## Despliegue en Render

1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno
3. Usa los comandos de build automáticos

## Tecnologías

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- IA: Deepseek via OpenRouter
- Base de datos: Memoria (desarrollo)