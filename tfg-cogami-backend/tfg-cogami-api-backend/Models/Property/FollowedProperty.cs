namespace tfg_cogami_api_backend.Models.Property
{
    public class FollowedProperty
    {
        public string Id { get; set; }
        public string Comment { get; set; }
        public string CategoryId { get; set; }
        // 1 = la vivienda tiene una notificación para que el usuario la vea
        // 0 = no existe notificación
        // -1 = tras ejecutar el script periodico, la vivienda ha dejado de existir y se marca de esta manera, el usuario al acceder al detalle de la vivienda
        // observará una alerta para indicarle que ya no existe la vivienda (ver Deleted en Property.cs)
        public int Notifications { get; set; } = 0;
        public string? NotificationMessage { get; set; } = null!;
    }
}
