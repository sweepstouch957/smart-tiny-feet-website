#!/bin/bash
# health_monitor.sh - Monitoreo de salud para Smart Tiny Feet Daycare

# Configuración
SITE_URL="${SITE_URL:-https://smarttinyfeet.com}"
EMAIL_ALERT="${EMAIL_ALERT:-admin@smarttinyfeet.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
LOG_FILE="${LOG_FILE:-/var/log/health_monitor.log}"
ALERT_THRESHOLD_RESPONSE_TIME="${ALERT_THRESHOLD_RESPONSE_TIME:-3.0}"
ALERT_THRESHOLD_DISK_USAGE="${ALERT_THRESHOLD_DISK_USAGE:-80}"
SSL_EXPIRY_WARNING_DAYS="${SSL_EXPIRY_WARNING_DAYS:-30}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Función para enviar alertas por email
send_email_alert() {
    local message="$1"
    local severity="$2"
    
    if command -v mail &> /dev/null && [ -n "$EMAIL_ALERT" ]; then
        echo "$message" | mail -s "[$severity] Smart Tiny Feet Website Alert" $EMAIL_ALERT
        log "Alerta enviada por email: $severity"
    fi
}

# Función para enviar alertas por Slack
send_slack_alert() {
    local message="$1"
    local severity="$2"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        local color="good"
        case $severity in
            "CRITICAL") color="danger" ;;
            "WARNING") color="warning" ;;
        esac
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"Smart Tiny Feet Website Alert\",
                    \"text\": \"[$severity] $message\",
                    \"ts\": $(date +%s)
                }]
            }" \
            $SLACK_WEBHOOK &> /dev/null
        
        log "Alerta enviada por Slack: $severity"
    fi
}

# Función para enviar alertas
send_alert() {
    local message="$1"
    local severity="$2"
    
    send_email_alert "$message" "$severity"
    send_slack_alert "$message" "$severity"
}

# Verificar disponibilidad del sitio
check_availability() {
    log "Verificando disponibilidad del sitio web..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}:%{time_connect}" $SITE_URL 2>/dev/null || echo "000:0:0")
    local http_code=$(echo $response | cut -d: -f1)
    local response_time=$(echo $response | cut -d: -f2)
    local connect_time=$(echo $response | cut -d: -f3)
    
    if [ "$http_code" = "200" ]; then
        log "Sitio web disponible - Código: $http_code, Tiempo: ${response_time}s"
        
        # Alertar si el tiempo de respuesta es muy alto
        if (( $(echo "$response_time > $ALERT_THRESHOLD_RESPONSE_TIME" | bc -l 2>/dev/null || echo 0) )); then
            warning "Tiempo de respuesta alto: ${response_time}s"
            send_alert "Tiempo de respuesta alto: ${response_time}s (umbral: ${ALERT_THRESHOLD_RESPONSE_TIME}s)" "WARNING"
        fi
    else
        error "Sitio web no disponible - Código: $http_code"
        send_alert "Sitio web no disponible - Código HTTP: $http_code" "CRITICAL"
        return 1
    fi
    
    return 0
}

# Verificar certificado SSL
check_ssl() {
    log "Verificando certificado SSL..."
    
    local domain=$(echo $SITE_URL | sed 's|https\?://||' | sed 's|/.*||')
    
    if command -v openssl &> /dev/null; then
        local expiry_date=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
        
        if [ -n "$expiry_date" ]; then
            local expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || echo 0)
            local current_epoch=$(date +%s)
            local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            if [ $days_until_expiry -lt $SSL_EXPIRY_WARNING_DAYS ]; then
                warning "Certificado SSL expira en $days_until_expiry días"
                send_alert "Certificado SSL expira en $days_until_expiry días" "WARNING"
            fi
            
            log "Certificado SSL válido por $days_until_expiry días más"
        else
            warning "No se pudo verificar el certificado SSL"
        fi
    else
        warning "OpenSSL no disponible, saltando verificación SSL"
    fi
}

# Verificar espacio en disco del servidor local
check_disk_space() {
    log "Verificando espacio en disco..."
    
    local disk_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    
    if [ $disk_usage -gt $ALERT_THRESHOLD_DISK_USAGE ]; then
        warning "Uso de disco alto: ${disk_usage}%"
        send_alert "Uso de disco alto: ${disk_usage}% (umbral: ${ALERT_THRESHOLD_DISK_USAGE}%)" "WARNING"
    fi
    
    log "Uso de disco: ${disk_usage}%"
}

# Verificar logs de error recientes
check_error_logs() {
    log "Verificando logs de error recientes..."
    
    local nginx_error_log="/var/log/nginx/smarttinyfeet_error.log"
    
    if [ -f "$nginx_error_log" ]; then
        local recent_errors=$(tail -100 $nginx_error_log | grep "$(date '+%Y/%m/%d')" | wc -l)
        
        if [ $recent_errors -gt 10 ]; then
            warning "Errores recientes en logs: $recent_errors"
            send_alert "Se detectaron $recent_errors errores en los logs de hoy" "WARNING"
        fi
        
        log "Errores en logs de hoy: $recent_errors"
    else
        warning "Log de errores de Nginx no encontrado: $nginx_error_log"
    fi
}

# Verificar conectividad de red
check_network() {
    log "Verificando conectividad de red..."
    
    if ping -c 1 8.8.8.8 &> /dev/null; then
        log "Conectividad de red OK"
    else
        error "Sin conectividad de red"
        send_alert "Sin conectividad de red detectada" "CRITICAL"
        return 1
    fi
    
    return 0
}

# Generar reporte de estado
generate_status_report() {
    local status_file="/tmp/smarttinyfeet_status.txt"
    
    {
        echo "=== Reporte de Estado - Smart Tiny Feet Daycare ==="
        echo "Fecha: $(date)"
        echo "URL: $SITE_URL"
        echo ""
        
        echo "Estado del sitio web:"
        if check_availability &> /dev/null; then
            echo "  ✓ Sitio web disponible"
        else
            echo "  ✗ Sitio web no disponible"
        fi
        
        echo ""
        echo "Estado del servidor:"
        echo "  Uso de disco: $(df -h / | awk 'NR==2{print $5}')"
        echo "  Carga del sistema: $(uptime | awk -F'load average:' '{print $2}')"
        echo "  Memoria libre: $(free -h | awk 'NR==2{printf "%.1f%%", $7/$2*100}')"
        
    } > $status_file
    
    echo $status_file
}

# Función principal
main() {
    log "Iniciando verificaciones de salud..."
    
    local exit_code=0
    
    # Ejecutar todas las verificaciones
    check_network || exit_code=1
    check_availability || exit_code=1
    check_ssl
    check_disk_space
    check_error_logs
    
    # Generar reporte si se solicita
    if [ "${1:-}" = "--report" ]; then
        local report_file=$(generate_status_report)
        log "Reporte generado: $report_file"
        cat $report_file
    fi
    
    log "Verificaciones completadas (código de salida: $exit_code)"
    exit $exit_code
}

# Mostrar ayuda
show_help() {
    echo "Smart Tiny Feet Daycare - Monitor de Salud"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  --report       Generar reporte de estado"
    echo ""
    echo "Variables de entorno:"
    echo "  SITE_URL                      URL del sitio (default: https://smarttinyfeet.com)"
    echo "  EMAIL_ALERT                   Email para alertas"
    echo "  SLACK_WEBHOOK                 Webhook de Slack para alertas"
    echo "  ALERT_THRESHOLD_RESPONSE_TIME Umbral de tiempo de respuesta (default: 3.0s)"
    echo "  ALERT_THRESHOLD_DISK_USAGE    Umbral de uso de disco (default: 80%)"
    echo "  SSL_EXPIRY_WARNING_DAYS       Días antes de expiración SSL para alertar (default: 30)"
}

# Procesar argumentos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac

