# Análisis Detallado del Proyecto: App Gestión Residencias

¡Hola! Esta guía está diseñada para que puedas exponer tu proyecto con total confianza. Aquí se desglosa la arquitectura, las tecnologías y los conceptos clave de Python y Django que se han utilizado, todo con ejemplos directos de tu código.

## 📚 Tabla de Contenidos
1. [Arquitectura Principal: El Patrón MVT de Django](#-arquitectura-principal-el-patrón-mvt-de-django)
2. [Características Clave de Python Utilizadas](#-características-clave-de-python-utilizadas)
3. [Profundizando en Conceptos de Django](#-profundizando-en-conceptos-de-django)
    - [Formularios (`forms.py`): El Guardián de tus Datos](#-formularios-formspy--el-guardián-de-tus-datos)
    - [El ORM de Django a Fondo: Consultas Inteligentes](#-el-orm-de-django-a-fondo-consultas-inteligentes)
    - [Comandos de Gestión Personalizados](#-comandos-de-gestión-personalizados)
4. [Análisis de Ficheros Clave](#-análisis-de-ficheros-clave)
5. [Flujo de Datos: Ejemplo de una Petición](#-flujo-de-datos-ejemplo-de-una-petición)
6. [Gestión de Dependencias y Entorno Virtual](#-gestión-de-dependencias-y-entorno-virtual)
7. [Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)

---

## 🏛️ Arquitectura Principal: El Patrón MVT de Django

Tu proyecto sigue la arquitectura **Modelo-Vista-Plantilla (MVT)**, que es la forma en que Django organiza el código para separar responsabilidades.

### 1. Modelos (`models.py`) - La Capa de Datos
Los modelos son el corazón de tu aplicación. Definen la estructura de tu base de datos utilizando clases de Python. Django se encarga de traducir estas clases en tablas y columnas.

- **¿Qué es?**: Son clases que heredan de `django.db.models.Model`. Cada atributo de la clase representa un campo en la base de datos.
- **¿Por qué se usa?**: Permite trabajar con la base de datos usando Python en lugar de SQL directamente. Esto se llama **ORM (Object-Relational Mapping)**. Es más rápido, seguro y menos propenso a errores.
- **Ejemplo en tu código (`complejos/models.py`)**:
  ```python
  # complejos/models.py

  class Complejo(models.Model):
      nombre = models.CharField(max_length=100)
      calle = models.CharField(max_length=255)
      # ... otros campos

  class Propiedad(models.Model):
      complejo = models.ForeignKey(Complejo, on_delete=models.CASCADE, related_name='propiedades')
      numero_identificador = models.CharField(max_length=20)
      # ... otros campos
  ```
  - `Complejo` y `Propiedad` son dos modelos.
  - `models.CharField` crea una columna de tipo texto.
  - `models.ForeignKey` crea una **relación "uno a muchos"**. Una `Propiedad` pertenece a un solo `Complejo`, pero un `Complejo` puede tener muchas `Propiedades`. `on_delete=models.CASCADE` significa que si borras un complejo, todas sus propiedades se borran también.

### 2. Vistas (`views.py`) - La Lógica de Negocio
Las vistas procesan las peticiones del usuario, interactúan con los modelos para obtener datos y deciden qué respuesta enviar.

- **¿Qué es?**: Son funciones (o clases) de Python que reciben un objeto `request` (con la información de la petición del usuario) y devuelven un objeto `response` (normalmente una página HTML renderizada).
- **¿Por qué se usa?**: Para separar la lógica de la presentación. La vista no sabe nada de HTML, solo prepara los datos y se los pasa a una plantilla.
- **Ejemplo en tu código (`users/views.py`)**:
  ```python
  # users/views.py

  from django.shortcuts import render
  from .models import CustomUser

  def es_admin(user):
      return user.is_authenticated and user.rol == CustomUser.Rol.ADMIN

  @user_passes_test(es_admin, login_url='/')
  def lista_usuarios_view(request):
      users = CustomUser.objects.all().select_related('persona')
      # ... lógica de filtrado ...
      context = {
          'users': users,
          # ... más contexto ...
      }
      return render(request, 'users/lista_usuarios.html', context)
  ```
  - `lista_usuarios_view` es una vista.
  - `CustomUser.objects.all()`: Usa el ORM para pedir a la base de datos todos los usuarios.
  - `render(...)`: Toma la petición, una plantilla (`lista_usuarios.html`) y un diccionario de "contexto" (`context`) y genera el HTML final.

### 3. Plantillas (`templates/`) - La Capa de Presentación
Las plantillas son los archivos HTML que definen la estructura de la página. Contienen marcadores de posición para los datos que les pasa la vista.

- **¿Qué es?**: Archivos HTML con el **Django Template Language (DTL)**, que permite incrustar lógica simple y variables.
- **¿Por qué se usa?**: Para separar el diseño (HTML/CSS) de la lógica (Python). Un diseñador web podría modificar las plantillas sin tocar el código Python.
- **Ejemplo en tu código (`users/templates/users/lista_usuarios.html`)**:
  ```html
  <!-- users/templates/users/lista_usuarios.html -->

  {% extends "base_dashboard.html" %}

  {% block content %}
    <h1>Lista de Usuarios</h1>
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Nombre</th>
          <th>Rol</th>
        </tr>
      </thead>
      <tbody>
        {% for user in users %}
          <tr>
            <td>{{ user.email }}</td>
            <td>{{ user.persona.nombres }} {{ user.persona.apellidos }}</td>
            <td>{{ user.get_rol_display }}</td>
          </tr>
        {% endfor %}
      </tbody>
    </table>
  {% endblock %}
  ```
  - `{% extends "..." %}`: Herencia de plantillas. Reutiliza un layout base.
  - `{% for user in users %}`: Un bucle `for`. La variable `users` viene del contexto que le pasó la vista.
  - `{{ user.email }}`: Imprime el valor de una variable.

---

## ✨ Características Clave de Python Utilizadas

Tu proyecto no solo usa Django, sino también varias características potentes de Python.

### 1. Programación Orientada a Objetos (POO)
Todo en Django se basa en objetos. Los modelos, las vistas basadas en clases (no las usas extensivamente, pero existen) y los formularios son ejemplos de POO.

- **Concepto**: Encapsular datos (atributos) y comportamientos (métodos) en "objetos".
- **Ejemplo en tu código (`users/models.py`)**:
  ```python
  class CustomUser(AbstractBaseUser, PermissionsMixin):
      # ... atributos ...
      
      def __str__(self):
          if self.persona:
              return f'{self.persona.nombres} {self.persona.apellidos}'
          return self.email
  ```
  - `CustomUser` es una clase.
  - `email`, `rol`, etc., son sus atributos.
  - `__str__` es un método especial que define cómo se debe representar el objeto como una cadena de texto (muy útil en el panel de administrador de Django).

### 2. Decoradores
Los decoradores son una forma avanzada y muy "pythónica" de modificar o extender el comportamiento de una función sin cambiar su código.

- **¿Qué es?**: Es una función que toma otra función como argumento, le añade alguna funcionalidad y devuelve una nueva función. Se usan con la sintaxis `@`.
- **¿Por qué se usa?**: Para reutilizar código de una manera limpia. Son perfectos para comprobaciones de permisos, logging, etc.
- **Ejemplo en tu código (`complejos/views.py`)**:
  ```python
  from django.contrib.auth.decorators import user_passes_test

  def es_admin(user):
      return user.is_authenticated and user.rol == CustomUser.Rol.ADMIN

  @user_passes_test(es_admin, login_url='/')
  def lista_complejos(request):
      # ...
  ```
  - `@user_passes_test(es_admin)` es un decorador de Django.
  - **Cómo funciona**: Antes de ejecutar `lista_complejos`, Django ejecuta la función `es_admin`. Si `es_admin` devuelve `True`, se ejecuta la vista. Si devuelve `False`, redirige al usuario a la `login_url` (`/`).
  - **Ventaja**: Proteges la vista para que solo los administradores puedan acceder, ¡con una sola línea de código! No tienes que repetir `if user.rol != 'ADMIN': return redirect(...)` en cada vista de administrador.

### 3. Tipado Estático (Type Hinting)
Aunque tu código no lo usa de forma extensiva, es una característica moderna de Python. Permite "anotar" qué tipo de dato espera una función y qué tipo devuelve.

- **¿Qué es?**: Añadir `: str` o `-> bool` a las firmas de las funciones.
- **¿Por qué se usa?**: No cambian cómo se ejecuta el código, pero mejoran enormemente la legibilidad y permiten que herramientas externas (como `mypy`) encuentren errores antes de ejecutar el programa.
- **Ejemplo de cómo se vería en tu código**:
  ```python
  # Función original
  def es_admin(user):
      return user.is_authenticated and user.rol == CustomUser.Rol.ADMIN

  # Con Type Hinting
  from .models import CustomUser
  def es_admin(user: CustomUser) -> bool:
      return user.is_authenticated and user.rol == CustomUser.Rol.ADMIN
  ```
  - `user: CustomUser` indica que se espera un objeto de tipo `CustomUser`.
  - `-> bool` indica que la función devolverá un booleano (`True` o `False`).

### 4. Módulos y Paquetes
Python organiza el código en módulos (archivos `.py`) y paquetes (carpetas con un archivo `__init__.py`). Django lleva esto un paso más allá con el concepto de **"apps"**.

- **¿Qué es una app de Django?**: Un paquete de Python autocontenido que cumple una función de negocio específica. En tu proyecto, `users`, `complejos` y `visitas` son apps.
- **¿Por qué se usa?**: Fomenta la **reutilización y la organización**. Podrías tomar la app `visitas` y, con algunas modificaciones, usarla en otro proyecto. Hace que el código sea mucho más fácil de mantener a medida que crece.

---

## 🧠 Profundizando en Conceptos de Django

Aquí exploramos en mayor detalle algunas de las herramientas más potentes de Django que estás utilizando.

### 1. Formularios (`forms.py`): El Guardián de tus Datos
Los formularios de Django son mucho más que simples campos de entrada en HTML. Son un sistema robusto para **recibir, validar y procesar datos** de los usuarios de forma segura.

- **¿Qué son?**: Clases que definen los campos de un formulario. Pueden estar vinculados a un modelo (`ModelForm`) o ser independientes (`Form`).
- **¿Por qué se usan?**:
    1.  **Seguridad**: Protegen contra ataques comunes como Cross-Site Scripting (XSS) y Cross-Site Request Forgery (CSRF). Django renderiza los formularios con un `{% csrf_token %}` que valida que la petición viene de tu propio sitio.
    2.  **Validación Centralizada**: Definen todas las reglas de los datos en un solo lugar. ¿Un DNI debe tener 8 dígitos? ¿La edad mínima es 18 años? Todo eso se define en el formulario.
    3.  **Renderizado Automático**: Django puede generar el HTML del formulario, ahorrando tiempo.
    4.  **Limpieza de Datos**: Convierten los datos recibidos (que siempre son texto) al tipo de dato correcto de Python (números, fechas, etc.).

- **Ejemplo en tu código (`users/forms.py`)**:
  Tu `CustomUserCreationForm` es un ejemplo excelente y complejo.
  ```python
  # users/forms.py
  class CustomUserCreationForm(forms.ModelForm):
      # ... definición de campos como email, password, etc. ...

      class Meta:
          model = CustomUser
          fields = [...]

      def clean(self):
          cleaned_data = super().clean()
          # ... lógica de validación ...
          if Persona.objects.filter(numero_documento=numero_documento).exists():
              self.add_error('numero_documento', 'Ya existe una persona con este DNI.')
          # ... más validaciones ...
          return cleaned_data

      def save(self, commit=True):
          user = super().save(commit=False)
          user.set_password(self.cleaned_data["password"])
          if commit:
              persona = Persona.objects.create(...)
              user.persona = persona
              user.save()
          return user
  ```
  - **`forms.ModelForm`**: Este formulario está directamente ligado al modelo `CustomUser`. Django usará la información del modelo para crear los campos.
  - **`class Meta`**: Le dice al `ModelForm` a qué modelo está asociado (`model = CustomUser`) y qué campos debe incluir.
  - **Método `clean()`**: Aquí ocurre la magia de la validación compleja. Este método se ejecuta después de las validaciones de cada campo individual. Es el lugar perfecto para lógicas que involucran múltiples campos, como:
      - Comprobar que un DNI no exista ya en la base de datos.
      - Exigir que el `complejo_asignado` no esté vacío si el `rol` es 'GUARDIA'.
      - Validar que la fecha de nacimiento corresponda a un mayor de 18 años.
      Si una validación falla, se usa `self.add_error()` para enviar un mensaje de error específico al usuario.
  - **Método `save()`**: Sobrescribes este método para manejar una lógica de guardado no estándar. En tu caso, el formulario recibe datos para dos modelos (`CustomUser` y `Persona`). El método `save()` orquesta la creación de ambos: primero crea el objeto `Persona`, luego lo asigna al `CustomUser` y finalmente guarda el usuario. También se encarga de hashear la contraseña con `user.set_password()`, un paso de seguridad crucial.

### 2. El ORM de Django a Fondo: Consultas Inteligentes
El ORM es tu traductor entre Python y SQL. Ya vimos `Model.objects.all()`, pero su verdadero poder está en la capacidad de crear consultas complejas y eficientes.

- **`QuerySets`**: La mayoría de las llamadas al ORM (`all()`, `filter()`, `exclude()`) no ejecutan una consulta a la base de datos inmediatamente. Devuelven un objeto `QuerySet`, que es como una "promesa" de una consulta. La consulta real solo se ejecuta cuando intentas acceder a los datos (por ejemplo, en un bucle `for` en una plantilla). Esto se llama **evaluación perezosa (lazy evaluation)** y es muy eficiente.

- **Filtrado de Datos**:
  - `filter()`: Para encontrar objetos que cumplen ciertas condiciones.
    ```python
    # Reservas que terminaron en el pasado y están confirmadas
    Reserva.objects.filter(estado='confirmada', fecha_fin__lte=timezone.now())
    ```
    El doble guion bajo (`__lte`) es la **sintaxis de lookup** de Django. `lte` significa "less than or equal" (menor o igual que). Hay muchos otros: `gt` (mayor que), `icontains` (contiene, sin distinguir mayúsculas/minúsculas), `startswith`, etc.

- **Consultas Complejas con `Q`**:
  Para hacer una consulta con una condición `OR`, no puedes simplemente pasar dos argumentos a `filter()` (eso sería un `AND`). Necesitas usar objetos `Q`.
  - **Ejemplo en tu código (`users/views.py`)**:
    ```python
    # users/views.py en lista_usuarios_view
    from django.db.models import Q

    users = users.filter(
        Q(email__icontains=query) |
        Q(persona__nombres__icontains=query) |
        Q(persona__apellidos__icontains=query)
    )
    ```
    Esto se traduce a: "Encuentra usuarios cuyo email CONTIENE el texto de búsqueda, O cuyo nombre CONTIENE el texto, O cuyo apellido CONTIENE el texto". El `|` (pipe) es el operador `OR`.

- **Optimización de Consultas (¡Muy Importante!)**:
  Django es perezoso, pero a veces puede ser "tonto" y hacer demasiadas consultas si no se lo indicas. Esto se conoce como el **problema N+1**.
  - **`select_related()`**: Se usa para relaciones "uno a uno" o "muchos a uno" (ForeignKey). Le dice a Django que, en la misma consulta, traiga también los datos del objeto relacionado.
    - **Ejemplo en tu código (`users/views.py`)**:
      ```python
      # users/views.py en lista_usuarios_view
      users = CustomUser.objects.all().select_related('persona')
      ```
      **Sin `select_related('persona')`**: Si tienes 100 usuarios, Django haría 1 consulta para traer los 100 usuarios. Luego, dentro de la plantilla, cada vez que accedes a `user.persona.nombres`, haría una nueva consulta para traer la `Persona` de ese usuario. Total: **101 consultas**.
      **Con `select_related('persona')`**: Django hace **1 sola consulta** que une las tablas `CustomUser` y `Persona` (usando un `JOIN` de SQL). Es muchísimo más eficiente.

  - **`prefetch_related()`**: Es similar, pero para relaciones "muchos a muchos" o "uno a muchos" inversas. Funciona de manera un poco diferente: hace una segunda consulta para traer todos los objetos relacionados y luego une los datos en Python.
    - **Ejemplo en tu código (`complejos/views.py`)**:
      ```python
      # complejos/views.py en gestionar_amenidades_view
      amenidades = Amenidad.objects.prefetch_related('reservas').all()
      ```
      **Sin `prefetch_related('reservas')`**: Si tienes 10 amenidades y en la plantilla accedes a las reservas de cada una, harías 1 consulta por las amenidades y luego 10 consultas más (una por cada amenidad para traer sus reservas). Total: **11 consultas**.
      **Con `prefetch_related('reservas')`**: Django hace **2 consultas** en total: una para todas las amenidades y otra para todas las reservas de esas amenidades. Luego, las une en Python. De nuevo, mucho más eficiente.

### 3. Comandos de Gestión Personalizados
Son scripts que puedes ejecutar desde la línea de comandos con `python manage.py <tu_comando>` y que tienen acceso a todo el entorno de tu proyecto (modelos, configuraciones, etc.).

- **¿Para qué se usan?**: Para tareas de automatización, mantenimiento o importación/exportación de datos. Son perfectos para ser ejecutados periódicamente por un **cron job** (en un servidor de producción).
- **Estructura**: Debes crear una estructura de carpetas específica dentro de una app: `management/commands/`. Dentro, cada archivo `.py` es un comando.
- **Ejemplo en tu código (`complejos/management/commands/actualizar_reservas.py`)**:
  ```python
  # complejos/management/commands/actualizar_reservas.py
  from django.core.management.base import BaseCommand
  from django.utils import timezone
  from complejos.models import Reserva

  class Command(BaseCommand):
      help = 'Actualiza el estado de las reservas completadas.'

      def handle(self, *args, **options):
          now = timezone.now()
          reservas_a_completar = Reserva.objects.filter(
              estado='confirmada',
              fecha_fin__lte=now
          )
          count = reservas_a_completar.update(estado='completada')
          self.stdout.write(self.style.SUCCESS(f'Se completaron {count} reservas.'))
  ```
  - **`class Command(BaseCommand)`**: Todo comando debe heredar de `BaseCommand`.
  - **`help`**: Un texto de ayuda que aparecerá si ejecutas `python manage.py help actualizar_reservas`.
  - **`handle(self, *args, **options)`**: Este es el método que contiene toda la lógica del comando. Se ejecuta cuando llamas al comando. En este caso, busca todas las reservas que ya terminaron y actualiza su estado a 'completada'.
  - **`self.stdout.write(...)`**: La forma correcta de imprimir mensajes en la consola desde un comando.

---

## 📄 Análisis de Ficheros Clave

### `config/settings.py`
Es el cerebro de tu proyecto. Aquí configuras todo.
- `INSTALLED_APPS`: Le dice a Django qué apps debe cargar. Aquí registras `users`, `complejos`, etc.
- `DATABASES`: Configura la conexión a la base de datos (en tu caso, un archivo SQLite).
- `AUTH_USER_MODEL = 'users.CustomUser'`: Una configuración muy importante. Le dice a Django que use tu modelo de usuario personalizado en lugar del que trae por defecto.
- `STATIC_URL` y `STATICFILES_DIRS`: Definen dónde se guardarán y desde dónde se servirán los archivos estáticos (CSS, JS, imágenes).

### `config/urls.py`
Es el primer punto de entrada para el enrutamiento. Actúa como una tabla de contenidos de las URLs de tu sitio.

- **¿Cómo funciona?**: Mapea patrones de URL a vistas o a otros archivos de URLs.
- **Ejemplo en tu código**:
  ```python
  # config/urls.py
  from django.urls import path, include

  urlpatterns = [
      path('admin/', admin.site.urls),
      path('', include('users.urls')), 
      path('admin_dashboard/', include('complejos.urls')),
      path('visitas/', include('visitas.urls')),
  ]
  ```
  - `path('visitas/', include('visitas.urls'))`: Le dice a Django: "Si la URL empieza con `visitas/`, ignora esa parte y pasa el resto de la URL al archivo `visitas/urls.py` para que él decida qué hacer". Esto mantiene el enrutamiento organizado por app.

---

## 🌊 Flujo de Datos: Ejemplo de una Petición

Imaginemos que un administrador entra a `http://127.0.0.1:8000/admin_dashboard/complejos/`.

1.  **Navegador**: Envía una petición GET a tu servidor.
2.  **Django**: Recibe la petición.
3.  **Enrutamiento (`config/urls.py`)**: Django ve que la URL empieza con `admin_dashboard/`. Pasa el resto (`complejos/`) al archivo `complejos/urls.py`.
4.  **Enrutamiento (`complejos/urls.py`)**: Este archivo tiene una línea como `path('complejos/', views.lista_complejos, name='lista_complejos')`. Coincide.
5.  **Decorador**: Antes de llamar a `lista_complejos`, el decorador `@user_passes_test(es_admin)` se ejecuta. Comprueba si el usuario ha iniciado sesión y si es administrador. Si es así, continúa.
6.  **Vista (`complejos/views.py`)**: Se ejecuta la función `lista_complejos(request)`.
    - La vista usa el ORM para consultar la base de datos: `Complejo.objects.all()`.
    - Prepara un diccionario de contexto con los datos: `context = {'complejos': ...}`.
    - Llama a `render()` pasándole la plantilla `complejos/lista_complejos.html` y el contexto.
7.  **Plantilla (`complejos/templates/complejos/lista_complejos.html`)**:
    - Django procesa el HTML.
    - El bucle `{% for complejo in complejos %}` itera sobre la lista de complejos del contexto.
    - Las variables `{{ complejo.nombre }}` se reemplazan por los datos reales.
8.  **Respuesta**: Django genera el HTML final y lo envía de vuelta al navegador.
9.  **Navegador**: Renderiza el HTML y el administrador ve la lista de complejos.

---

## 📦 Gestión de Dependencias y Entorno Virtual

### `requirements.txt`
Este archivo es una lista de todas las librerías de Python de las que depende tu proyecto (como `Django`, `Pillow`, etc.).

- **¿Por qué se usa?**: Para garantizar que cualquier persona que trabaje en el proyecto use exactamente las mismas versiones de las librerías. Esto evita el clásico "en mi máquina sí funciona". Se instalan todas con un solo comando: `pip install -r requirements.txt`.

### Carpeta `venv/`
Esta carpeta contiene un **entorno virtual**.

- **¿Qué es?**: Una copia aislada de Python y sus librerías, específica para tu proyecto.
- **¿Por qué se usa?**: Para evitar conflictos de dependencias entre diferentes proyectos. Si el Proyecto A necesita Django 3.0 y el Proyecto B necesita Django 4.0, cada uno puede tener su propia versión en su propio entorno virtual sin interferir con el otro.

---

## 🚀 Cómo Ejecutar el Proyecto

Estos son los pasos para que cualquiera pueda poner en marcha tu aplicación.

1.  **Clonar el repositorio**:
    ```bash
    git clone <URL_DEL_PROYECTO>
    cd App-Gesti-n-Residencias
    ```
2.  **Crear y activar el entorno virtual**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows: venv\Scripts\activate
    ```
3.  **Instalar dependencias**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Aplicar las migraciones**: Este comando lee tus modelos y crea o actualiza las tablas en la base de datos.
    ```bash
    python manage.py migrate
    ```
5.  **Crear un superusuario** (para poder acceder como administrador):
    ```bash
    python manage.py createsuperuser
    ```
6.  **Iniciar el servidor de desarrollo**:
    ```bash
    python manage.py runserver
    ```

¡Y listo! La aplicación estará funcionando en `http://127.0.0.1:8000/`.
