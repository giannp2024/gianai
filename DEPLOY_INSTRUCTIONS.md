# Instrucciones de Despliegue para Render

## Pasos para desplegar Gian AI en Render:

### 1. Subir a GitHub
- Crea un repositorio nuevo en GitHub
- Sube todos los archivos del proyecto

### 2. Configurar en Render
- Ve a https://render.com y crea una cuenta
- Haz clic en "New +" → "Web Service"
- Conecta tu repositorio de GitHub
- Selecciona el repositorio de Gian AI

### 3. Configuración del servicio
- **Name:** gian-ai (o el nombre que prefieras)
- **Environment:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Auto-Deploy:** Yes

### 4. Variables de entorno
En la sección "Environment", agrega:
- **OPENAI_API_KEY:** `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`
- **NODE_ENV:** `production`

### 5. Desplegar
- Haz clic en "Create Web Service"
- Render automáticamente construirá y desplegará tu aplicación
- En unos minutos tendrás una URL pública funcionando

### Notas importantes:
- La aplicación funcionará en el plan gratuito de Render
- La URL será algo como: `https://gian-ai.onrender.com`
- El primer acceso puede tardar un poco si la app estuvo inactiva