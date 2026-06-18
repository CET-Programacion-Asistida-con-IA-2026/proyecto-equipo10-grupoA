const map = L.map("map").setView([-34.6037,-58.3816],11);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:"OpenStreetMap"
    }
).addTo(map);

const puntos = [

    [-34.6037,-58.3816,"Corrientes y Pellegrini"],
    [-34.6180,-58.3818,"Garay y Lima"],
    [-34.5957,-58.3768,"Esmeralda y Santa Fe"],
    [-34.5874,-58.3977,"Las Heras y Pueyrredón"],
    [-34.6099,-58.4050,"Mitre y Pueyrredón"],
    [-34.6247,-58.4038,"Plaza Martín Fierro"],
    [-34.6503,-58.4151,"Av. Sáenz"],
    [-34.6298,-58.3942,"Caseros y Rioja"],
    [-34.6032,-58.4208,"Corrientes y Medrano"],
    [-34.6202,-58.4381,"Rivadavia y Centenera"],
    [-34.6447,-58.4634,"Eva Perón y Varela"],
    [-34.6815,-58.4623,"Guaminí"],
    [-34.6834,-58.4482,"Barrio Savio"],
    [-34.6681,-58.4540,"Escalada"],
    [-34.6398,-58.5208,"Carhué"],
    [-34.6214,-58.5051,"Lope de Vega"],
    [-34.6045,-58.5035,"Cuenca"],
    [-34.5631,-58.4856,"Plaza Jorge Casal"],
    [-34.5612,-58.4563,"Cabildo y Juramento"],
    [-34.5868,-58.4076,"Coronel Díaz"],
    [-34.6027,-58.4304,"Scalabrini Ortiz"],
    [-34.5750,-58.4794,"Los Incas"]

];

puntos.forEach(p=>{

    L.marker([p[0],p[1]])
    .addTo(map)
    .bindPopup(
        "<b>Punto de hidratación / agua segura</b><br>"+p[2]
    );

});

const zonasRiesgo = [

    {
        nombre:"Reserva Costanera Sur",
        coords:[-34.612,-58.357],
        color:"red",
        riesgo:"Alerta alta por contaminación y presencia frecuente de cianobacterias"
    },

    {
        nombre:"La Boca - Ribera",
        coords:[-34.635,-58.363],
        color:"red",
        riesgo:"Zona de riesgo alto por contaminación histórica"
    },

    {
        nombre:"Puerto Madero",
        coords:[-34.603,-58.363],
        color:"yellow",
        riesgo:"Precaución ante episodios variables de contaminación"
    },

    {
        nombre:"Costanera Norte",
        coords:[-34.553,-58.415],
        color:"yellow",
        riesgo:"Precaución por floraciones estacionales"
    },

    {
        nombre:"Vicente López Costero",
        coords:[-34.520,-58.470],
        color:"green",
        riesgo:"Riesgo bajo actualmente"
    },

    {
        nombre:"Quilmes Costero",
        coords:[-34.720,-58.255],
        color:"red",
        riesgo:"Contaminación costera elevada"
    },

    {
        nombre:"Berisso / Ensenada",
        coords:[-34.870,-57.900],
        color:"yellow",
        riesgo:"Zona industrial cercana"
    }

];

zonasRiesgo.forEach(z => {

    L.circleMarker(
        z.coords,
        {
            radius:10,
            color:z.color,
            fillColor:z.color,
            fillOpacity:1,
            weight:2
        }
    )
    .addTo(map)
    .bindPopup(
        "<b>"+z.nombre+"</b><br>" +
        z.riesgo
    );

});