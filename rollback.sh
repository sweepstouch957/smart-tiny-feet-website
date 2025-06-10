#!/bin/bash
# rollback.sh - Script de rollback para Smart Tiny Feet Daycare

set -e

# Configuración
REMOTE_SERVER="${REMOTE_SERVER:-user@smarttinyfeet.com}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/html}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/smarttinyfeet}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Función para mostrar backups disponibles
show_backups() {
    echo -e "${BLUE}Backups disponibles:${NC}"
    echo "===================="
    ssh $REMOTE_SERVER "cd $BACKUP_DIR && ls -la | grep '^d' | tail -n +4 | awk '{print \$9, \$6, \$7, \$8}'" | while read backup date time; do
        if [ "$backup" != "latest" ]; then
            echo "  $backup ($date $time)"
        fi
    done
    echo ""
}

# Función para verificar que un backup existe
verify_backup() {
    local backup_name="$1"
    if ssh $REMOTE_SERVER "[ -d $BACKUP_DIR/$backup_name ]"; then
        return 0
    else
        return 1
    fi
}

# Función para realizar rollback
perform_rollback() {
    local backup_name="$1"
    
    log "Iniciando rollback a $backup_name..."
    
    # Verificar que el backup existe
    if ! verify_backup "$backup_name"; then
        error "Backup $backup_name no encontrado."
        exit 1
    fi
    
    # Crear backup de la versión actual antes del rollback
    local current_backup="rollback_$(date +%Y%m%d_%H%M%S)"
    warning "Creando backup de la versión actual como $current_backup..."
    ssh $REMOTE_SERVER "mkdir -p $BACKUP_DIR/$current_backup"
    ssh $REMOTE_SERVER "cd $REMOTE_PATH && tar -czf $BACKUP_DIR/$current_backup/site_files.tar.gz ."
    
    # Realizar rollback
    log "Restaurando backup $backup_name..."
    ssh $REMOTE_SERVER "cd $REMOTE_PATH && tar -xzf $BACKUP_DIR/$backup_name/site_files.tar.gz"
    
    # Verificar que el sitio funciona después del rollback
    log "Verificando funcionamiento del sitio web..."
    sleep 5
    
    SITE_URL="http://smarttinyfeet.com"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $SITE_URL || echo "000")
    
    if [ "$RESPONSE" = "200" ]; then
        log "Rollback completado exitosamente. Sitio web funcionando correctamente."
        info "Backup de la versión anterior guardado como: $current_backup"
    else
        error "Sitio web no responde correctamente después del rollback (código: $RESPONSE)"
        warning "Puede ser necesario intervención manual."
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "Smart Tiny Feet Daycare - Script de Rollback"
    echo ""
    echo "Uso: $0 [opciones] [backup_name]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -l, --list     Listar backups disponibles"
    echo "  -i, --interactive  Modo interactivo para seleccionar backup"
    echo ""
    echo "Ejemplos:"
    echo "  $0 -l                    # Listar backups disponibles"
    echo "  $0 20241201_143022       # Rollback a backup específico"
    echo "  $0 -i                    # Modo interactivo"
    echo ""
    echo "Variables de entorno:"
    echo "  REMOTE_SERVER  Servidor remoto (default: user@smarttinyfeet.com)"
    echo "  REMOTE_PATH    Ruta remota (default: /var/www/html)"
    echo "  BACKUP_DIR     Directorio de backups (default: /var/backups/smarttinyfeet)"
}

# Modo interactivo
interactive_mode() {
    show_backups
    
    echo -n "Ingrese el nombre del backup a restaurar (o 'q' para salir): "
    read backup_name
    
    if [ "$backup_name" = "q" ] || [ "$backup_name" = "quit" ]; then
        info "Operación cancelada."
        exit 0
    fi
    
    if [ -z "$backup_name" ]; then
        error "Debe especificar un nombre de backup."
        exit 1
    fi
    
    echo -n "¿Está seguro de que desea realizar rollback a '$backup_name'? (y/N): "
    read confirmation
    
    if [ "$confirmation" = "y" ] || [ "$confirmation" = "Y" ] || [ "$confirmation" = "yes" ]; then
        perform_rollback "$backup_name"
    else
        info "Operación cancelada."
        exit 0
    fi
}

# Procesar argumentos de línea de comandos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -l|--list)
        show_backups
        exit 0
        ;;
    -i|--interactive)
        interactive_mode
        exit 0
        ;;
    "")
        error "Debe especificar un backup o usar modo interactivo (-i)"
        echo ""
        show_help
        exit 1
        ;;
    *)
        # Asumir que es un nombre de backup
        backup_name="$1"
        echo -n "¿Está seguro de que desea realizar rollback a '$backup_name'? (y/N): "
        read confirmation
        
        if [ "$confirmation" = "y" ] || [ "$confirmation" = "Y" ] || [ "$confirmation" = "yes" ]; then
            perform_rollback "$backup_name"
        else
            info "Operación cancelada."
            exit 0
        fi
        ;;
esac

