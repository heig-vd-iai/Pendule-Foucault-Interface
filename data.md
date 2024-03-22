# Donnée du pendule 

<v-app id="data">
  La position de la sphère du pendule est mesurée à l'aide d'une caméra située à proximité du mécanisme d'entretien. On peut voir sur le graphique ci-dessous la position de la sphère en temps réel.
  <div id="position_chart"></div>
  Le mouvement permettant de maintenir l'oscillation du pendule est fourni par le mécanisme d'entretien. On peut voir une vidéo en direct du mécanisme d'entretien ci-dessous ainsi qu'un graphique représentant son mouvement.
  <img
          src="http://10.190.177.147:8060/axis-cgi/mjpg/video.cgi"></img>

  <div id="excitation_chart"></div>
</v-app>

<script>
  const { createApp } = Vue
  const { createVuetify } = Vuetify

  const vuetify = createVuetify()
  Vue.createApp({
    data() {
    return {
        data: {
          x: [0],
          y: [0],
          z: 0,
        },
        timeSlider: [10, 20],
        timeValue: 0,
        uPlotInstanceLive: null,
        uPlotInstanceData: null,
        uPlotInstanceDriver: null,
        ws: null,
        zHold: 0,
      };
    },
    methods: {
      handleSliderEnd() {
        // console.log(this.data.timeSlider)
        this.ws.send(JSON.stringify({ type: 'historic', time: this.data.timeSlider }))
      }
    },
    mounted() {
      const length = 100;
      let z = Array.from({ length }, (v, i) => 0);
      let t = Array.from({ length }, (v, i) => Date.now() / 1000);

      this.ws = new WebSocket('ws://10.190.177.147:8765');

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type == "broadcast"){
            this.data.x = message.x;
            this.data.y = message.y;
            this.data.z = message.z * 1000;
          }
          if (message.type == "historic"){
            this.uPlotInstanceData.setData([message.x, message.y]);
          }
          
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket :', error);
        }
      };
      this.ws.onopen = () => {
        console.log('Connexion WebSocket ouverte.');
      };
      this.ws.onerror = (error) => {
        console.error('Erreur WebSocket :', error);
      };

      this.ws.onclose = () => {
        console.log('Connexion WebSocket fermée.');
      };
        const optsDriver = {
          title: "Mouvement d'excitation",
          id: "excitation_chart",
          width: 600,
          height: 400,
          pxAlign: false,
          legend: { show: false },
          scales: {
            y: {
              // auto: true,
              range: [-20, 20],
            },
            x: {
              time: true,
            }
          },
          axes: [
            {
              show: false
            },
            {
              label: "mm"
            }
          ],
          series: [
            {
            },
            {
              label: "z",
              stroke: "#ea5545",
            },
          ],
        }

      const optsLive = {
        title: "Position en direct",
        // mode: 2,
        id: "position_chart",
        width: 600,
        height: 600,
        pxAlign: false,
        legend: { show: false},
        scales: {
          y: {
            range: [-1200, 1200],
            label: "mm",
          },
          x: {
            range: [-1200, 1200],
            label: "mm",
            time: false,
          }
        },
        axes: [
          {
            space: 100,
            grid: { show: true },
            ticks: { show: false },
            show: true,
          },
          {
            scale: "y",
            space: 100,
            grid: { show: true },
            ticks: { show: false },
          },
        ],
        series: [
          {
            stroke: "#ea5545",
          },
          {
            stroke: "#ea5545",
            fill: "#ea5545",
            width: 5,
          },
        ],
      }

      let hold = Array.from([Array.from({ length }, (v, i) => 30), Array.from({ length }, (v, i) => 1000)]);

      time = null

      const getData = () => {
        return [
          [this.data.x],
          [this.data.y],
        ];
      };


      const getDataDriver = () => {
        return [
          t = t.slice(1).concat(Date.now() / 1000),
          z = z.slice(1).concat(this.data.z),
        ];
      };

      let data = getData();

      this.uPlotInstanceLive = new uPlot(optsLive, data, document.getElementById("position_chart"));
      this.uPlotInstanceDriver = new uPlot(optsDriver, getDataDriver(), document.getElementById("excitation_chart"));;


      const update = () => {
        const data = getData();
        this.uPlotInstanceLive.setData(data);
        if (this.zHold != this.data.z){
          const dataDriver = getDataDriver();
          this.zHold = this.data.z;
          this.uPlotInstanceDriver.setData(dataDriver);
        }
        requestAnimationFrame(update);
      };

    update();
  },

}).use(vuetify).mount('#data')