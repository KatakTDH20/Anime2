const app = Vue.createApp({
  data() {
      return {
          animes: [],
          busqueda: "",
          generos: [],
          generoSeleccionado: "Todos",
          cargando: false,
          error: "",
          progreso: 100,
          cantidad: 1,
          totalArticulos: 0, // Total de artículos en el carrito
      };
  },
  computed: {
      animesFiltrados() {
          let filtrados = this.animes;

          // Filtrar por género
          if (this.generoSeleccionado !== "Todos") {
              filtrados = filtrados.filter(anime =>
                  anime.genres.some(genre => genre.name === this.generoSeleccionado)
              );
          }

          // Filtrar por búsqueda
          if (this.busqueda) {
              filtrados = filtrados.filter(anime =>
                  anime.title.toLowerCase().includes(this.busqueda.toLowerCase())
              );
          }

          this.actualizarProgreso(filtrados.length, this.animes.length);

          return filtrados;
      },
  },
  mounted() {
      this.cargarAnimes();
      // Inicializar el total de artículos al cargar la página
      this.obtenerTotalArticulos();

      // Escuchar cambios en el almacenamiento para actualizar el total
      window.addEventListener("storage", this.obtenerTotalArticulos);
  },
  methods: {
      async cargarAnimes() {
          this.cargando = true;
          this.error = "";
          try {
              const response = await axios.get("https://api.jikan.moe/v4/anime");
              this.animes = response.data.data;

              const generosUnicos = new Set();
              this.animes.forEach(anime =>
                  anime.genres.forEach(genre => generosUnicos.add(genre.name))
              );
              this.generos = Array.from(generosUnicos);

              this.progreso = 100;
          } catch (error) {
              console.error("Error al cargar los animes:", error);
              this.error = "No se pudo cargar el catálogo. Por favor, intenta más tarde.";
          } finally {
              this.cargando = false;
          }
      },
      incrementarCantidad() {
          if (this.cantidad < 6) {
              this.cantidad++;
          }
      },
      decrementarCantidad() {
          if (this.cantidad > 1) {
              this.cantidad--;
          }
      },
      filtrarPorGenero(genero) {
          this.generoSeleccionado = genero;
      },
      verMas(anime) {
          // Guardar los datos del anime seleccionado en localStorage
          const datosAnime = {
              title: anime.title,
              synopsis: anime.synopsis || "Sin sinopsis disponible.",
              episodes: anime.episodes || "Desconocido",
              score: anime.score || "N/A",
              genres: anime.genres.map(g => g.name).join(", "),
              image_url: anime.images.jpg.image_url,
              cantidad: this.cantidad,
          };
          localStorage.setItem("animeSeleccionado", JSON.stringify(datosAnime));

          // Redirigir a detalle.html
          window.location.href = "detalle.html";
      },
      actualizarProgreso(filtrados, total) {
          // Calcula el porcentaje basado en el número de animes filtrados
          this.progreso = total > 0 ? Math.round((filtrados / total) * 100) : 0;
      },
      obtenerTotalArticulos() {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        this.totalArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);
    },
  },
  beforeUnmount() {
    // Quitar el listener al salir de la página
    window.removeEventListener("storage", this.obtenerTotalArticulos);
},
});

app.mount("#app");


const det = Vue.createApp({
    data() {
        return {
            anime: null,
            cantidad: 1,
            precioDVD: 100,
            precioBluRay: 150,
            formatoSeleccionado: 'DVD',  // Valor por defecto
            totalArticulos: 0, // Total de artículos en el carrito
        };
    },
    computed: {
        precioTotal() {
            let precioUnitario = this.formatoSeleccionado === 'Blu-ray' ? this.precioBluRay : this.precioDVD;
            return (precioUnitario * this.cantidad).toFixed(2);
        }
    },
    mounted() {
        const data = JSON.parse(localStorage.getItem("animeSeleccionado"));
        if (data) {
            this.anime = data;
        }
        this.actualizarTotalArticulos();
         // Inicializar el total de artículos al cargar la página
         this.obtenerTotalArticulos();

         // Escuchar cambios en el almacenamiento para actualizar el total
         window.addEventListener("storage", this.obtenerTotalArticulos);
    },
    methods: {
        incrementarCantidad() {
            if (this.cantidad < 6) {
                this.cantidad++;
            }
        },
        decrementarCantidad() {
            if (this.cantidad > 1) {
                this.cantidad--;
            }
        },
        agregarAlCarrito() {
            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        
        // Verificar si el anime ya está en el carrito con el mismo formato
        const index = carrito.findIndex(
            item => item.title === this.anime.title && item.formato === this.formatoSeleccionado
        );

        if (index !== -1) {
            // Si ya existe, actualizar la cantidad
            carrito[index].cantidad += this.cantidad;
        } else {
            // Si no existe, agregar nuevo producto
            carrito.push({
                title: this.anime.title,
                image_url: this.anime.image_url,
                cantidad: this.cantidad,
                formato: this.formatoSeleccionado, // Formato seleccionado
                precioUnitario: this.formatoSeleccionado === "Blu-ray" ? this.precioBluRay : this.precioDVD,
            });
        }

        // Guardar en LocalStorage
        localStorage.setItem("carrito", JSON.stringify(carrito));
        alert(`Se han agregado ${this.cantidad} unidades de ${this.anime.title} en formato ${this.formatoSeleccionado} al carrito.`);
        },
        actualizarTotalArticulos() {
            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            const totalArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);
            localStorage.setItem("totalArticulos", totalArticulos);
        },
        obtenerTotalArticulos() {
            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            this.totalArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);
            console.log("Total artículos:", this.totalArticulos);

        },
    },
    beforeUnmount() {
        // Quitar el listener al salir de la página
        window.removeEventListener("storage", this.obtenerTotalArticulos);
    },
});

det.mount('#detalleAnime');

const carritoApp = Vue.createApp({
    data() {
        return {
            carrito: JSON.parse(localStorage.getItem("carrito")) || [],
        };
    },
    computed: {
        subtotal() {
            return this.carrito.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
        },
        iva() {
            return this.subtotal * 0.16;
        },
        total() {
            return this.subtotal + this.iva;
        },
        totalArticulos() {
            return this.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        },
    },
    methods: {
        actualizarCarrito() {
            // Validar límites de cantidad
            this.carrito.forEach(item => {
                if (item.cantidad < 1) {
                    item.cantidad = 1; // Mínimo
                } else if (item.cantidad > 10) {
                    item.cantidad = 10; // Máximo
                }
            });

            // Guardar en LocalStorage
            localStorage.setItem("carrito", JSON.stringify(this.carrito));
        },
        eliminarProducto(index) {
            this.carrito.splice(index, 1);
            this.actualizarCarrito();
        },
    },
    mounted() {
        this.actualizarCarrito();
    },
});

carritoApp.mount("#carrito");

