import { createApp } from 'vue';

const app = createApp({})
export default {
  data() {
    return {
      data: {
        x: [0],
        y: [0],
      },
      uPlotInstance: null
    };
  },
  mounted() {
    const ws = new WebSocket('ws://10.190.179.14:8765');

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.data.x = message.x;
        this.data.y = message.y;
      } catch (error) {
        console.error('Erreur lors du parsing du message WebSocket :', error);
      }
    };
    ws.onopen = () => {
      console.log('Connexion WebSocket ouverte.');
    };
    ws.onerror = (error) => {
      console.error('Erreur WebSocket :', error);
    };

    ws.onclose = () => {
      console.log('Connexion WebSocket fermée.');
    };

    const opts = {
      title: "Position",
      id: "position_chart",
      width: 400,
      height: 400,
      pxAlign: false,
      legend: { show: false },
      scales: {
        y: {
          // auto: true,
          range: [-1000, 1000], //TODO: auto scale
        },
        x: {
          range: [-1000, 1000],
          time: false
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
        }
      ],
      series: [
        {
          legend: { show: false },
          stroke: "#ea5545",
        },
        {
          legend: { show: false },
          stroke: "#ea5545",
        },
      ],
    }

    const getData = () => {
      return [
        [this.data.x],
        [this.data.y],
      ];
    };

    let data = getData();

    this.uPlotInstance = new uPlot(opts, [[], [], [], [], []], document.getElementById("position_chart"));


    const update = () => {
      const data = getData();
      this.uPlotInstance.setData(data);
      requestAnimationFrame(update);
    };

    update();
  }
}
</script >

  <template>
    <div>
      <div id="position_chart"></div>
    </div>
  </template>
