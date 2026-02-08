# PASOS PARA CONFIGURAR MERCADO PAGO
## Ingresar en mercadopago.com/developers
## Crear una cuenta
## Ir a https://www.mercadopago.com.ar/developers/panel/app para ver la el panel de administrador de nuestras aplicaciones
## podemos crear una aplicación en Crear aplicación
1 - Nombre de la aplicación
2 - tipo de solución de pago para integrar es Pagos online
3 - Si estas usando una plataforma de e-commerce respuesta: no
4 - Que producto estas integrando? , es Checkout Pro
5 - Crear aplicación


### Veremos en la barra lateral opciones como Cuentas de prueba
1 - Crear cuenta y vendedor
2 - Con la cuenta de comprador tenemos que loguearnos para poder realizar el pago con la cuenta de comprador
3 - Con la cuenta de vendedor tenemos que crear las credenciales de "producción" (son cuentas de prueba) la vamos a usar para poder probar nuestra aplicación.
4 - Credenciales de produccion son las que usaremos cuando querramos llevarlo a produccion


### Vamos a abrir la cuenta de Vendedor
1- Abrimos una nueva pagina en otro buscador como Firefox para loguearmos con las credenciales de Vendedor(seramos nosotros)
## Crear de nuevo una aplicación
1 - Podemos ponerle el mismo nombre que le pusimos a la cuenta principal agregandole "vendedor". Ej: new-ecommerce-vendedor para hacer de cuenta que es el vendedor
2 - ¿Que tipo de solucion de pago vas a integrar? , Pagos online
3 - ¿Estas usando una plataforma de e-commerce?, No
4 - ¿Que producto estas integrando? , Checkout Pro
5 - Creamos aplicación


## Barra lateral de la aplicación venderdor
1 - Algunas opciones de pruebas deshabilitadas
2 - Usamos las credenciales de producción. Si bien es una cuenta de prueba, tenemos que usar las credenciales de producción.
3 - Vamos a usar su Access Token




## Configurar el Webhooks
1 -  Esto nos envia las notificaciones de mercado pago y la información
2 - Ir a webhook de la cuenta de prueba del vendedor en Firefox
3 - Click en Configurar notificaciones, tenemos modo de prueba y modo productivo
4 - Selecciona la Pestaña Modo productivo y proporciona una URL HTTPS para recibir notificaciones con tu integración productiva.Podemos probarlo cuando lo tengas deployado en render.
5- Validar el origen de la notificacion para asegurar la seguridad y la autenticidad de la información recibida.




## Deployamos en Render
1 - Deployamos el backend
2-  Ir a firefox en la cuenta de prueva vendedor, configurar notificaciones webhooks y pegar el dominio del backend
3- elegimos Pagos
4- Guardar configuración
5 - Genera una clave sercreta a la que la agregamos como MERCADOPAGO_WEBHOOK_SECRET


### Testear compra
Para testear una compra tenemos que hacer lo siguiente:
1- debemos abrir la aplicación en otro browser como firefox
2 - loguearnos con la credenciales del comprador
3 - Realizar la compra de prueba
