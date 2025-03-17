# NestJS Load Test App

Este proyecto consiste en una aplicación **NestJS** con un endpoint de prueba de carga, **dockerizada** y desplegada en **Kubernetes** usando un **LoadBalancer** para distribuir las solicitudes entre múltiples réplicas.



## Índice

- [Descripción General](#descripción-general)
- [Requisitos Previos](#requisitos-previos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo de la Aplicación (NestJS)](#desarrollo-de-la-aplicación-nestjs)
- [Dockerización de la Aplicación](#dockerización-de-la-aplicación)
- [Despliegue en Kubernetes](#despliegue-en-kubernetes)
  - [Deployment](#deployment)
  - [Service (LoadBalancer)](#service-loadbalancer)
- [Pruebas de Carga](#pruebas-de-carga)
- [Conclusiones](#conclusiones)



## Descripción General

Esta aplicación expone un endpoint `/api/load-test` para simular carga en el servidor. El objetivo es **demostrar** cómo Kubernetes maneja múltiples réplicas de la aplicación bajo alto tráfico y cómo un Service de tipo **LoadBalancer** reparte las peticiones entre los Pods.

---

## Requisitos Previos

1. **Node.js** (versión 16 o superior).
2. **Nest CLI** (si vas a generar un proyecto desde cero).
3. **Docker** (para construir la imagen).
4. **Kubernetes** (por ejemplo, un clúster local con Minikube o un clúster en la nube).
5. **Kubectl** configurado para apuntar a tu clúster.

---

## Estructura del Proyecto
```
nestjs-load-test/
├─ dist/                      # Código compilado (generado al hacer 'npm run build')
├─ node_modules/
├─ src/
│   ├─ app.controller.ts      # Controlador principal
│   ├─ app.module.ts          # Módulo raíz
│   ├─ app.service.ts         # Servicio principal
│   └─ main.ts                # Punto de entrada de NestJS
├─ test/
├─ Dockerfile                 # Instrucciones para construir la imagen Docker
├─ deployment.yaml            # Manifiesto de Deployment en Kubernetes
├─ service.yaml               # Manifiesto de Service tipo LoadBalancer
├─ package.json
├─ README.md                  # (Este archivo)
└─ ...
```
---

## Desarrollo de la Aplicación (NestJS)

Creación del proyecto (opcional si ya lo descargaste):

```nest new nestjs-load-test```

Agregamos el endpoint de prueba de carga en app.controller.ts:

```
import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('load-test')
  loadTest(): string {
    let result = 0;
    for (let i = 0; i < 1_000_000; i++) {
      result += Math.sqrt(i);
    }
    return `Operación completada. Resultado: ${result.toFixed(2)}`;
  }
}
```
Ejecutamos en local:

```npm run start```

Revisa http://localhost:3000/api/load-test para comprobar que responde.

## Dockerización de la Aplicación

1.Creamos el Dockerfile (ya existente en la raíz del proyecto). Un ejemplo para Node 16 o 18:

```
FROM node:16-alpine   # O node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build     # Compilación a dist/
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

2. Construimos la imagen:

```docker build -t nestjs-load-test:latest .```

3. Probamos el contenedor localmente:

```docker run -p 3000:3000 nestjs-load-test:latest```

Verifica de nuevo http://localhost:3000/api/load-test.

## Despliegue en Kubernetes

Si usas Minikube, asegúrate de construir la imagen dentro del Docker de Minikube o subir la imagen a un registry (Docker Hub). Ejemplo con Minikube:

``` minikube start --driver=docker
eval $(minikube docker-env)
docker build -t nestjs-load-test:latest . 
```


### Deployment
En el archivo deployment.yaml:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-load-test-deployment
  labels:
    app: nestjs-load-test
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nestjs-load-test
  template:
    metadata:
      labels:
        app: nestjs-load-test
    spec:
      containers:
        - name: nestjs-load-test
          image: nestjs-load-test:latest
          ports:
            - containerPort: 3000
```


### Aplicamos en el clúster:

```kubectl apply -f deployment.yaml```

### Service (LoadBalancer)
En service.yaml:

```
apiVersion: v1
kind: Service
metadata:
  name: nestjs-load-test-service
spec:
  type: LoadBalancer
  selector:
    app: nestjs-load-test
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
```

#### Aplicamos el Service:

```kubectl apply -f service.yaml```

En Minikube, un LoadBalancer mostrará el `EXTERNAL-IP` en `<pending>`. Para acceder, puedes usar:

`minikube service nestjs-load-test-service`
Esto abrirá automáticamente la URL en tu navegador.

## Pruebas de Carga
Con el clúster corriendo y tu servicio disponible, puedes probar el endpoint `/api/load-test` con herramientas como Apache Bench o JMeter.

### Apache Bench

```ab -n 1000 -c 1000 http://<EXTERNAL_URL>/api/load-test```

- `-n 1000` = número total de peticiones
- `-c 1000` = concurrencia (peticiones simultáneas)

### JMeter

- Crea un Thread Group con 1000 threads y 1 loop.
- Configura un HTTP Request apuntando a `<EXTERNAL_URL>/api/load-test.`
- Observa resultados en “View Results in Table” o “Graph.”

Verás cómo la aplicación responde bajo alta concurrencia y cómo Kubernetes reparte la carga entre réplicas.


## Conclusiones
- NestJS facilita la creación de endpoints para pruebas de carga, con muy poca configuración.
- Docker te permite empaquetar la aplicación con todas sus dependencias y desplegarla de forma uniforme.
- Kubernetes junto a un Deployment con múltiples réplicas y un Service de tipo LoadBalancer demuestra cómo se puede escalar la aplicación y distribuir el tráfico.
- Pruebas de carga como AB o JMeter muestran el rendimiento y cómo el tráfico es distribuido entre los Pods.


## Autor

- Rut Santos | 2-17-1270