// 📝 ARCHIVO DE PRÁCTICAS JS
// Escribe aquí tus soluciones a los retos.
// Cuando termines uno, avísame para que lo revise.

// --- RETO 1: El Transformador (.map) ---
const nombres = ['adrian', 'stiven', 'pedro'];
const precios = [10, 60, 25, 100, 5];
const usuarios = [
    { id: 1, nombre: 'Ana' },
    { id: 2, nombre: 'Juan' },
    { id: 3, nombre: 'Rosa' }
];
// Tu código aquí:

nombres.map(nombre => {
    return nombre.toUpperCase();// tegn usar retur par apoder devolver el resultado cierto o de esta froam ya no enecesasio
});

nombres.map(nombre => nombre.toUpperCase());// dee sta froma se hace mas corto el retorn o cierto?


precios.filter(precio => {
    return precio > 20;
});

usuarios.find(usuario => usuario.id === 2);

const nuevoObject = { ...postOriginal, likes: 10 };


// --- RETO 5: Nivel Pro (Mezclando Filter y Map) ---
// Tienes una lista de comentarios, algunos están vacíos (sin título).
// Tarea: Filtra los que NO están vacíos y luego conviértelos todos a MAYÚSCULAS.

const comentariosSucios = [
    { id: 1, titulo: 'Me gusta mucho' },
    { id: 2, titulo: '' }, // Este está vacío
    { id: 3, titulo: 'Gran post' },
    { id: 4, titulo: '   ' } // Este también cuenta como vacío
];

// Tu código para el Reto 5 aquí:


// --- EXTRA: Conceptos Poderosos que verás en Angular ---

// 1. DESESTRUCTURACIÓN (Extraer datos rápido)
const miPost = { id: 99, autor: 'Stiven', tags: ['angular', 'pro'] };
// En lugar de: const idPost = miPost.id;
const { id, autor } = miPost; // ¡Ya tienes 'id' y 'autor' como variables!

// 2. ENCADENAMIENTO OPCIONAL (?.)
// Evita que la app se rompa si algo no tiene datos.
const postSinImagen = { id: 1, texto: 'hola' };
const url = postSinImagen.image?.url; // Devuelve undefined en vez de romper la app.

// 3. OPERADOR TERNARIO (El if/else de una línea)
const logueado = true;
const mensaje = logueado ? 'Bienvenido' : 'Inicia sesión';


///////////
const postWithComment = comentariosSucios.filter(comentario => comentario.titulo.trim() !== '')
    .map(comentario => comentario.titulo.toUpperCase());
///////////

// --- RETO 6: El Detectiv (.find) ---
// Tienes una lista de usuarios y un ID.
// Tarea: Encuentra el usuario completo (objeto) que coincida con ese ID.

const listaUsuarios = [
    { id: 101, nombre: 'Carlos', rol: 'admin' },
    { id: 102, nombre: 'Maria', rol: 'editor' },
    { id: 103, nombre: 'Luis', rol: 'viewer' }
];
const idBuscado = 102;

// Tu código para el Reto 6 aquí:

const user = listaUsuarios.find(usuario => usuario.id === idBuscado);


// --- RETO 7: El Constructor (.filter + .map) ---
// Tienes productos con precios.
// Tarea: Filtra los que cuestan más de 50 y muéstrame solo su nombre en mayúsculas.

const productos = [
    { nombre: 'Laptop', precio: 1200 },
    { nombre: 'Mouse', precio: 25 },
    { nombre: 'Teclado', precio: 80 },
    { nombre: 'Monitor', precio: 300 }
];

// Tu código para el Reto 7 aquí:

const productoaa = productos.filter(producto => producto.precio >= 50)
    .map(producto => {
        return producto.nombre
    });


// --- RETO 8: El Inmutable (Spread Operator) ---
// Tienes un objeto post y quieres "actualizar" su título.
// Tarea: Crea un NUEVO objeto (no modifiques el original) con el título cambiado.

const postOriginal = { id: 1, titulo: 'Mi primer post', likes: 0 };

// Tu código para el Reto 8 aquí:
const newpost = { ...postOriginal }
newpost.titulo = "este es el nuevo"



// --- RETO 9: El Limpiador (Filter + Trim) ---
// Tienes comentarios con espacios extra.
// Tarea: Filtra los que tengan texto real (después de quitar espacios) y muéstralos limpios.

const comentarios = [
    { texto: '  Hola  ' },
    { texto: 'Mundo' },
    { texto: '   ' }, // Este es solo espacio
    { texto: 'Angular' }
];

// Tu código para el Reto 9 aquí:

comentarios.filter(comentario => comentario.texto.trim() === '')


// --- RETO 10: El Buscador de Objetos (Find) ---
// Tienes una lista de usuarios y quieres saber si alguno es "admin".
// Tarea: Usa .find() para obtener el primer usuario admin que encuentres.

const usuariosParaBuscar = [
    { nombre: 'Ana', esAdmin: false },
    { nombre: 'Pedro', esAdmin: false },
    { nombre: 'Sofia', esAdmin: true },
    { nombre: 'Luis', esAdmin: false }
];

// Tu código para el Reto 10 aquí:
usuariosParaBuscar.find(user => user.esAdmin)// esto sola devuelve un cierto?


// --- RETO EXTRA: El Resumen (Reduce) ---
// Tienes una lista de precios.
// Tarea: Calcula el precio total sumándolos todos.

const listaPrecios = [10, 20, 30, 40, 50];

// Tu código para el Reto Extra aquí:

listaPrecios.reduce((acumulador, precio) => {
    return acumulador + precio
}, 0)
