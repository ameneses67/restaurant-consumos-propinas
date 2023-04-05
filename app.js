let cliente = {
  mesa: "",
  hora: "",
  pedido: [],
};

const categorias = {
  1: "Comida",
  2: "Bebidas",
  3: "Postres",
};

const btnGuardarCliente = document.querySelector("#guardar-cliente");
btnGuardarCliente.addEventListener("click", guardarCliente);

function guardarCliente() {
  const mesa = document.querySelector("#mesa").value;
  const hora = document.querySelector("#hora").value;

  // verificar si hay campos vacíos
  const camposVacios = [mesa, hora].some((campo) => campo === "");

  if (camposVacios) {
    // verificar si ya hay una alerta
    const existeAlerta = document.querySelector(".invalid-feedback");

    if (!existeAlerta) {
      const alerta = document.createElement("div");
      alerta.classList.add("invalid-feedback", "d-block", "text-center");
      alerta.textContent = "Todos los campos son obligatorios";

      document.querySelector(".modal-body form").appendChild(alerta);

      // desaparecer alerta después de 3 segundos
      setTimeout(() => {
        alerta.remove();
      }, 3000);
    }

    return;
  }

  // asignar datos del formulario al objeto del cliente
  cliente = { ...cliente, mesa, hora }; // si ponemos el spread operator al final va a sobrescribir la mesa y la hora con el objeto cliente pero vacío, por eso al poner primero el spread operator copiamos el objeto vacío y luego le ponemos el valor de la mesa y la hora

  // ocultar modal
  const modalFormulario = document.querySelector("#formulario");
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  // mostrar secciones de platillos y resumen
  mostrarSecciones();

  // obtener platillos de la api de json-server
  obtenerPlatillos();
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll(".d-none");
  seccionesOcultas.forEach((seccion) => seccion.classList.remove("d-none"));
}

function obtenerPlatillos() {
  const url = "http://localhost:4000/platillos";

  fetch(url)
    .then((respuesta) => respuesta.json())
    .then((resultado) => mostrarPlatillos(resultado))
    .catch((error) => console.log(error));
}

function mostrarPlatillos(platillos) {
  const contenido = document.querySelector("#platillos .contenido");

  platillos.forEach((platillo) => {
    const row = document.createElement("div");
    row.classList.add("row", "py-3", "border-top");

    const nombre = document.createElement("div");
    nombre.classList.add("col-md-4");
    nombre.textContent = platillo.nombre;

    const precio = document.createElement("div");
    precio.classList.add("col-md-3", "fw-bold");
    precio.textContent = `$${platillo.precio}`;

    const categoria = document.createElement("div");
    categoria.classList.add("col-md-3");
    categoria.textContent = categorias[platillo.categoria];

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = 0;
    inputCantidad.value = 0;
    inputCantidad.id = `producto-${platillo.id}`;
    inputCantidad.classList.add("form-control");

    // función que detecta la cantidad y el platillo que se está agregando
    inputCantidad.onchange = () => {
      const cantidad = parseInt(inputCantidad.value);
      agregarPlatillo({ ...platillo, cantidad });
    };

    const agregar = document.createElement("div");
    agregar.classList.add("col-md-2");
    agregar.appendChild(inputCantidad);

    row.appendChild(nombre);
    row.appendChild(precio);
    row.appendChild(categoria);
    row.appendChild(agregar);

    contenido.appendChild(row);
  });
}

function agregarPlatillo(producto) {
  // extraer el pedido actual
  let { pedido } = cliente;

  // revisar que la cantidad sea mayor a 0 para empezar a agregarlo
  if (producto.cantidad) {
    // verificar si el elemento ya existe en el array
    if (pedido.some((articulo) => articulo.id === producto.id)) {
      // el artículo ya existe, entonces actualizar la cantidad
      const pedidoActualizado = pedido.map((articulo) => {
        if (articulo.id === producto.id) {
          articulo.cantidad = producto.cantidad;
        }
        return articulo;
      });
      // se asign el nuevo array a cliente.pedido
      cliente.pedido = [...pedidoActualizado];
    } else {
      // el artículo no existe, entonces se añade al array del pedido
      cliente.pedido = [...pedido, producto];
    }
  } else {
    // eliminar elementos cuando la cantidad es 0
    const resultado = pedido.filter((articulo) => articulo.id !== producto.id);
    cliente.pedido = [...resultado];
  }
  // limpiar el html previo
  limpiarHTML(document.querySelector("#resumen .contenido"));

  // mostrar resumen
  actualizarResumen();
}

function actualizarResumen() {
  const contenido = document.querySelector("#resumen .contenido");

  const resumen = document.createElement("div");
  resumen.classList.add("col-md-6", "card", "py-5", "px-3", "shadow");

  // información de la mesa
  const mesa = document.createElement("p");
  mesa.textContent = "Mesa: ";
  mesa.classList.add("fw-bold");

  const mesaSpan = document.createElement("span");
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add("fw-normal");

  // información de la hora
  const hora = document.createElement("p");
  hora.textContent = "Hora: ";
  hora.classList.add("fw-bold");

  const horaSpan = document.createElement("span");
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add("fw-normal");

  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  // actualizar título de la sección
  const heading = document.createElement("h3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = "Platillos Consumidos";

  // iterar sobre el array de pedidos
  const grupo = document.createElement("ul");
  grupo.classList.add("list-group");

  const { pedido } = cliente;
  pedido.forEach((articulo) => {
    const { nombre, cantidad, precio, id } = articulo;
    const lista = document.createElement("li");
    lista.classList.add("list-group-item");

    // nombre del artículo
    const nombreEl = document.createElement("h4");
    nombreEl.classList.add("my-4");
    nombreEl.textContent = nombre;

    // cantidad del artículo
    const cantidadEl = document.createElement("p");
    cantidadEl.classList.add("fw-bold");
    cantidadEl.textContent = "Cantidad: ";

    const cantidadValor = document.createElement("span");
    cantidadValor.classList.add("fw-normal");
    cantidadValor.textContent = cantidad;

    // precio del artículo
    const precioEl = document.createElement("p");
    precioEl.classList.add("fw-bold");
    precioEl.textContent = "Precio: ";

    const precioValor = document.createElement("span");
    precioValor.classList.add("fw-normal");
    precioValor.textContent = `$${precio}`;

    // subtotal del artículo
    const subtotalEl = document.createElement("p");
    subtotalEl.classList.add("fw-bold");
    subtotalEl.textContent = "Subtotal: ";

    const subtotalValor = document.createElement("span");
    subtotalValor.classList.add("fw-normal");
    subtotalValor.textContent = `$${cantidad * precio}`;

    // agregar valores a sus contenedores
    cantidadEl.appendChild(cantidadValor);
    precioEl.appendChild(precioValor);
    subtotalEl.appendChild(subtotalValor);

    // agregar elementos al li
    lista.appendChild(nombreEl);
    lista.appendChild(cantidadEl);
    lista.appendChild(precioEl);
    lista.appendChild(subtotalEl);

    // agregar lista al grupo principal
    grupo.appendChild(lista);
  });

  // agregar al contenido
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(heading);
  resumen.appendChild(grupo);

  contenido.appendChild(resumen);
}

function limpiarHTML(elemento) {
  while (elemento.firstChild) {
    elemento.removeChild(elemento.firstChild);
  }
}
