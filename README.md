Instrucciones _backend_ para entorno de desarrollo
- Descargar MongoDB siguiendo el tutorial paso a paso de este enlace https://www.mongodb.com/docs/manual/administration/install-community/
- Crear una base de datos llamada "cogami" con las colecciones: User, Search, Location, Property y Category (crearlas con contenido vacío)
- Añadir _data_ de las localizaciones para la colección Location. Para ello importamos los JSON de los ficheros _idealista-locations.json_ y _fotocasa-locations.json_ de la carpeta **tfg-cogami-backend
/locations_script**
- Descargar Visual Studio 2022 y abrir la solución _tfg-cogami-api-backend.sln_
- Compilar la solución y ejecutar en el entorno de _debug_
- En el caso de que no se conecte a la base de datos es importante modificar la conexión en el fichero _appSettings.json_

Instrucciones _frontend_ para entorno de desarrollo
- Tener descargado node.js en su versión más reciente junto con npm
- Entrar a la carpeta del front y ejecutar un **npm install**
- Ejecutar un **npm run dev** o cualquiera de los comandos de ejecución que se encuentran en el fichero _package.json_
