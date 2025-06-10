#!/bin/bash
# deploy.sh - Script principal de despliegue para Smart Tiny Feet Daycare

set -e  # Salir en caso de error

# Configuración
PROJECT_DIR="$(pwd)"
REMOTE_SERVER="${REMOTE_SERVER:-user@smarttinyfeet.com}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/html}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/smarttinyfeet}"
LOG_FILE="${LOG_FILE:-/var/log/deploy.log}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Función de cleanup en caso de error
cleanup() {
    error "Error detectado. Ejecutando cleanup..."
    # Restaurar backup si es necesario
    if [ -f "$BACKUP_DIR/latest/site_files.tar.gz" ]; then
        warning "Restaurando backup anterior..."
        ssh $REMOTE_SERVER "cd $REMOTE_PATH && tar -xzf $BACKUP_DIR/latest/site_files.tar.gz"
    fi
    exit 1
}

# Configurar trap para cleanup
trap cleanup ERR

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        error "pnpm no está instalado"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git no está instalado"
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        error "rsync no está instalado"
        exit 1
    fi
    
    log "Todas las dependencias están disponibles"
}

# Función principal de despliegue
deploy() {
    log "Iniciando proceso de despliegue..."

    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrese de estar en el directorio del proyecto."
        exit 1
    fi

    # Actualizar código desde repositorio (si es un repositorio git)
    if [ -d ".git" ]; then
        log "Actualizando código desde repositorio..."
        git fetch origin
        git reset --hard origin/main
    fi

    # Instalar/actualizar dependencias
    log "Instalando dependencias..."
    pnpm install --frozen-lockfile

    # Ejecutar tests (si existen)
    if grep -q '"test"' package.json; then
        log "Ejecutando tests..."
        pnpm run test || warning "Tests fallaron, continuando con despliegue..."
    fi

    # Construir para producción
    log "Construyendo aplicación para producción..."
    pnpm run build

    # Verificar que el directorio dist existe
    if [ ! -d "dist" ]; then
        error "El directorio dist no fue generado. Verifique el proceso de construcción."
        exit 1
    fi

    # Crear backup de la versión actual en el servidor
    log "Creando backup de la versión actual..."
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ssh $REMOTE_SERVER "mkdir -p $BACKUP_DIR/$BACKUP_TIMESTAMP"
    ssh $REMOTE_SERVER "cd $REMOTE_PATH && tar -czf $BACKUP_DIR/$BACKUP_TIMESTAMP/site_files.tar.gz . 2>/dev/null || true"
    ssh $REMOTE_SERVER "ln -sfn $BACKUP_DIR/$BACKUP_TIMESTAMP $BACKUP_DIR/latest"

    # Subir archivos al servidor
    log "Subiendo archivos al servidor..."
    rsync -avz --delete dist/ $REMOTE_SERVER:$REMOTE_PATH/

    # Verificar que el sitio web funciona
    log "Verificando funcionamiento del sitio web..."
    sleep 5  # Esperar un momento para que los archivos se propaguen
    
    SITE_URL="http://smarttinyfeet.com"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $SITE_URL || echo "000")
    
    if [ "$RESPONSE" = "200" ]; then
        log "Despliegue exitoso. Sitio web funcionando correctamente."
    else
        error "Sitio web retorna código $RESPONSE"
        cleanup
    fi

    # Limpiar backups antiguos (mantener últimos 10)
    log "Limpiando backups antiguos..."
    ssh $REMOTE_SERVER "cd $BACKUP_DIR && ls -t | tail -n +11 | xargs -r rm -rf"

    log "Proceso de despliegue completado exitosamente."
    log "Sitio web disponible en: $SITE_URL"
}

# Mostrar ayuda
show_help() {
    echo "Smart Tiny Feet Daycare - Script de Despliegue"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -c, --check    Solo verificar dependencias"
    echo "  -b, --build    Solo construir, no desplegar"
    echo ""
    echo "Variables de entorno:"
    echo "  REMOTE_SERVER  Servidor remoto (default: user@smarttinyfeet.com)"
    echo "  REMOTE_PATH    Ruta remota (default: /var/www/html)"
    echo "  BACKUP_DIR     Directorio de backups (default: /var/backups/smarttinyfeet)"
    echo "  LOG_FILE       Archivo de log (default: /var/log/deploy.log)"
}

# Procesar argumentos de línea de comandos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -c|--check)
        check_dependencies
        exit 0
        ;;
    -b|--build)
        log "Solo construyendo aplicación..."
        pnpm install --frozen-lockfile
        pnpm run build
        log "Construcción completada. Archivos disponibles en ./dist/"
        exit 0
        ;;
    "")
        check_dependencies
        deploy
        ;;
    *)
        error "Opción desconocida: $1"
        show_help
        exit 1
        ;;
esac

