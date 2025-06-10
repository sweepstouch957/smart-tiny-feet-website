# Smart Tiny Feet Daycare - Guía de Instalación Rápida

Este README proporciona instrucciones paso a paso para instalar y desplegar el sitio web de Smart Tiny Feet Daycare en su servidor.

## Requisitos Previos

- **Node.js** 18.0 o superior
- **pnpm** (gestor de paquetes recomendado)
- **Git** para control de versiones
- **Servidor web** (Nginx recomendado)
- **Acceso SSH** al servidor de producción

## Instalación Rápida

### 1. Preparar el Entorno

```bash
# Instalar Node.js (usando nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Instalar pnpm
npm install -g pnpm

# Verificar instalaciones
node --version
pnpm --version
```

### 2. Obtener el Código

```bash
# Si tiene acceso al repositorio Git
git clone [URL_DEL_REPOSITORIO]
cd smart-tiny-feet-website

# O si recibió los archivos comprimidos
unzip smart-tiny-feet-website.zip
cd smart-tiny-feet-website
```

### 3. Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
pnpm install
```

### 4. Desarrollo Local (Opcional)

```bash
# Ejecutar servidor de desarrollo
pnpm run dev

# El sitio estará disponible en http://localhost:5173
```

### 5. Construcción para Producción

```bash
# Construir aplicación para producción
pnpm run build

# Los archivos optimizados estarán en el directorio ./dist/
```

## Despliegue en Servidor

### Opción A: Despliegue Manual

```bash
# 1. Construir la aplicación
pnpm run build

# 2. Copiar archivos al servidor
scp -r dist/* user@servidor:/var/www/html/

# 3. Configurar permisos
ssh user@servidor "chmod -R 644 /var/www/html/* && chmod 755 /var/www/html"
```

### Opción B: Despliegue Automatizado

```bash
# 1. Hacer ejecutables los scripts
chmod +x deploy.sh rollback.sh health_monitor.sh

# 2. Configurar variables de entorno
export REMOTE_SERVER="user@smarttinyfeet.com"
export REMOTE_PATH="/var/www/html"

# 3. Ejecutar despliegue
./deploy.sh
```

## Configuración del Servidor Web

### Nginx

```bash
# 1. Copiar configuración de Nginx
sudo cp nginx-smarttinyfeet.conf /etc/nginx/sites-available/smarttinyfeet.com

# 2. Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/smarttinyfeet.com /etc/nginx/sites-enabled/

# 3. Verificar configuración
sudo nginx -t

# 4. Recargar Nginx
sudo systemctl reload nginx
```

### Apache

```bash
# Crear archivo .htaccess en /var/www/html/
cat > /var/www/html/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|webp)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
EOF
```

## Scripts Incluidos

### deploy.sh
Script principal de despliegue que automatiza todo el proceso.

```bash
# Despliegue completo
./deploy.sh

# Solo verificar dependencias
./deploy.sh --check

# Solo construir (no desplegar)
./deploy.sh --build
```

### rollback.sh
Script para revertir a versiones anteriores.

```bash
# Modo interactivo
./rollback.sh -i

# Listar backups disponibles
./rollback.sh --list

# Rollback a backup específico
./rollback.sh 20241201_143022
```

### health_monitor.sh
Script de monitoreo de salud del sitio web.

```bash
# Verificación básica
./health_monitor.sh

# Generar reporte completo
./health_monitor.sh --report
```

## Configuración de Monitoreo

### Cron Jobs Recomendados

```bash
# Editar crontab
crontab -e

# Agregar las siguientes líneas:
# Monitoreo cada 5 minutos
*/5 * * * * /path/to/health_monitor.sh

# Backup diario a las 2 AM
0 2 * * * /path/to/backup.sh

# Reporte semanal los lunes a las 9 AM
0 9 * * 1 /path/to/health_monitor.sh --report | mail -s "Reporte Semanal" admin@smarttinyfeet.com
```

## Variables de Entorno

Puede personalizar el comportamiento de los scripts mediante variables de entorno:

```bash
# Configuración del servidor
export REMOTE_SERVER="user@smarttinyfeet.com"
export REMOTE_PATH="/var/www/html"
export BACKUP_DIR="/var/backups/smarttinyfeet"

# Configuración de alertas
export EMAIL_ALERT="admin@smarttinyfeet.com"
export SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Umbrales de monitoreo
export ALERT_THRESHOLD_RESPONSE_TIME="3.0"
export ALERT_THRESHOLD_DISK_USAGE="80"
```

## Solución de Problemas Comunes

### Error: "Cannot resolve module"
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Build fails with memory issues"
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm run build
```

### Sitio no carga después del despliegue
```bash
# Verificar permisos
chmod -R 644 /var/www/html/*
chmod 755 /var/www/html

# Verificar configuración del servidor web
sudo nginx -t
sudo systemctl reload nginx
```

## Estructura de Archivos

```
smart-tiny-feet-website/
├── src/                    # Código fuente
├── dist/                   # Archivos de producción (generados)
├── deploy.sh              # Script de despliegue
├── rollback.sh            # Script de rollback
├── health_monitor.sh      # Script de monitoreo
├── nginx-smarttinyfeet.conf # Configuración de Nginx
├── package.json           # Dependencias del proyecto
└── README.md              # Este archivo
```

## Soporte

Para problemas técnicos o preguntas:

1. Consulte la documentación técnica completa (`documentacion-tecnica.md`)
2. Revise los logs del servidor en `/var/log/nginx/`
3. Ejecute el script de monitoreo: `./health_monitor.sh --report`

## Seguridad

- Siempre use HTTPS en producción
- Configure certificados SSL válidos
- Mantenga el servidor actualizado
- Revise regularmente los logs de seguridad
- Use contraseñas fuertes y autenticación por clave SSH

## Actualizaciones

Para actualizar el sitio web:

1. Actualice el código fuente
2. Ejecute `./deploy.sh`
3. Verifique que el sitio funcione correctamente
4. En caso de problemas, use `./rollback.sh -i`

---

**Nota:** Esta es una guía de instalación rápida. Para información técnica detallada, consulte el archivo `documentacion-tecnica.md`.

