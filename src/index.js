import Konva from "konva";

var width = window.innerWidth;
var height = window.innerHeight;

var crop = {
  x: 50,
  y: 50,
  width: 200,
  height: 100
};
const group = new Konva.Group({
  draggable: true
});

const transformer = new Konva.Transformer({
  nodes: [group],
  rotateEnabled: false
});

const fakeRect = new Konva.Rect({
  opacity: 0.2,
  listening: false,
  ...crop
});

const transformer2 = new Konva.Transformer({
  visible: false,
  nodes: [fakeRect],
  anchorFill: "yellow",
  rotateEnabled: false
});

const cropButton = document.getElementById("crop");
const doneButton = document.getElementById("done");
const cancelButton = document.getElementById("cancel");

const stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height
});

const layer = new Konva.Layer();
stage.add(layer);

const image = Konva.Image.fromURL(
  "https://konvajs.org/assets/darth-vader.jpg",
  function (darthNode) {
    darthNode.setAttrs({
      ...crop,
      crop: {
        ...crop
      }
      // draggable: true
    });
    const darthNode2 = darthNode.clone();
    fakeRect.width(crop.width);
    fakeRect.height(crop.height);
    darthNode.setAttrs({
      name: "main"
    });

    darthNode2.setAttrs({
      opacity: 0.5,
      name: "silhouette",
      crop: undefined,
      visible: false,
      x: 0,
      y: 0,
      width: 438,
      height: 300
    });

    darthNode2.on("dragmove", (e) => {
      let imageNode = stage.findOne(".main");
      let image = stage.findOne(".silhouette").image();
      const { x, y, scaleX } = e.target.getAttrs();
      //Set crop
      let min = {
        x: (-image.width * scaleX + crop.width + crop.x) * scaleX,
        y: -image.height + crop.height + crop.y
      };
      const max = { x: crop.x, y: crop.y };
      let newX = Math.max(min.x, Math.min(max.x, x));
      let newY = Math.max(min.y, Math.min(max.y, y));

      e.target.x(newX);
      e.target.y(newY);

      imageNode.cropX(crop.x - newX);
      imageNode.cropY(crop.y - newY);
    });
    group.add(darthNode2);
    group.add(darthNode);
    group.add(fakeRect);

    layer.add(group);
    layer.add(transformer);
    layer.add(transformer2);
  }
);

function startCropping() {
  doneButton.removeAttribute("disabled");
  cancelButton.removeAttribute("disabled");
  cropButton.setAttribute("disabled", true);
  group.draggable(false);
  const mask = stage.findOne(".silhouette");

  // Allow drag through main when cropping active
  const main = stage.findOne(".main");
  main.listening(false);

  mask.visible(true);
  mask.draggable(true);
  // transformer.visible(false);
  transformer2.visible(true);
}

function cancelCropping() {
  doneButton.setAttribute("disabled", true);
  cancelButton.setAttribute("disabled", true);
  cropButton.removeAttribute("disabled");

  // Make main image draggable again when cropping inactive
  const main = stage.findOne(".main");
  main.listening(true);

  stage.findOne(".silhouette").visible(true);
  group.draggable(true);
  const mask = stage.findOne(".silhouette");
  mask.visible(false);
  mask.draggable(false);
  transformer.visible(true);
  transformer2.visible(false);
}

cropButton.onclick = () => {
  startCropping();
};

doneButton.onclick = () => {
  cancelCropping();
};
cancelButton.onclick = () => {
  cancelCropping();
};

group.on("dblclick", () => {
  startCropping();
});
