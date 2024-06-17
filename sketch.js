// function preload() {
//   VCR_OSD_MONO = loadFont("fonts/VCR_OSD.ttf");
// }

let kdTree;
let debugMode = false;
let lineShow = true;
let colorShow = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // textFont(VCR_OSD_MONO);

  kdTree = new KDTree();
  // for (let i = 0; i < 1000; i++) {
  //   const x = random(0, width);
  //   const y = random(0, height);
  //   kdTree.insert(createVector(x, y));
  // }
}

function draw() {
  background(255);
  kdTree.display();
}

function mousePressed() {
  kdTree.insert(createVector(mouseX, mouseY));
}

function keyPressed() {
  if (keyCode === 67) {
    colorShow = !colorShow;
  }
  if (keyCode === 68) {
    debugMode = !debugMode;
  }
  if (keyCode === 76) {
    lineShow = !lineShow;
  }

  if (keyCode === 48) {
    kdTree.traverseAllNodes(kdTree.root, (node) => {
      node.targetPercentage.set(0.5, 0.5);
      node.ease.update(node.targetPercentage);
    });
  }

  if (keyCode === 32) {
    kdTree.traverseAllNodes(kdTree.root, (node) => {
      const randomX = random(1);
      const randomY = random(1);
      node.targetPercentage.set(randomX, randomY);
      node.ease.update(node.targetPercentage);
    });
  }
}

class Node {
  constructor(x, y, axis, minX = 0, maxX = width, minY = 0, maxY = height) {
    this.axis = axis;
    this.percentage = createVector(
      (x - minX) / (maxX - minX),
      (y - minY) / (maxY - minY)
    );
    // this.percentage.set(0.5, 0.5);
    this.left = null;
    this.right = null;

    this.padding = 0;

    this.minX = minX + this.padding;
    this.maxX = maxX - this.padding;
    this.minY = minY + this.padding;
    this.maxY = maxY - this.padding;

    this.colAlpha = 0;
    this.colSet = [0, 255];
    // this.colSet = [color(255, 255, 0), color(255, 0, 255), color(0, 255, 255)];
    this.colR_left = random(this.colSet);
    this.colG_left = random(this.colSet);
    this.colB_left = random(this.colSet);
    this.colR_right = random(this.colSet);
    this.colG_right = random(this.colSet);
    this.colB_right = random(this.colSet);
    this.colLeft = color(this.colR_left, this.colG_left, this.colB_left);
    this.colRight = color(this.colR_right, this.colG_right, this.colB_right);

    this.targetPercentage = createVector(this.percentage.x, this.percentage.y);
    this.ease = new EaseVec2(this.percentage, this.targetPercentage);
    this.updatePos();
  }

  updatePos() {
    this.ease.easeVec2(1);

    this.pos = createVector(
      this.minX + this.percentage.x * (this.maxX - this.minX),
      this.minY + this.percentage.y * (this.maxY - this.minY)
    );

    this.updateBounds(this.minX, this.maxX, this.minY, this.maxY);
  }

  updateBounds(minX, maxX, minY, maxY) {
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;

    if (this.left) {
      this.left.updateBounds(
        minX,
        this.axis === 0 ? this.pos.x : maxX,
        minY,
        this.axis === 1 ? this.pos.y : maxY
      );
    }
    if (this.right) {
      this.right.updateBounds(
        this.axis === 0 ? this.pos.x : minX,
        maxX,
        this.axis === 1 ? this.pos.y : minY,
        maxY
      );
    }
  }

  displayVertices() {
    // if (!this.left || !this.right) {
    colorShow ? fill(this.colLeft, this.colAlpha) : noFill();
    beginShape();
    if (this.axis === 0) {
      vertex(this.minX, this.minY);
      vertex(this.pos.x, this.minY);
      vertex(this.pos.x, this.maxY);
      vertex(this.minX, this.maxY);
    } else {
      vertex(this.minX, this.minY);
      vertex(this.maxX, this.minY);
      vertex(this.maxX, this.pos.y);
      vertex(this.minX, this.pos.y);
    }
    endShape(CLOSE);
    colorShow ? fill(this.colRight) : noFill();
    beginShape();
    if (this.axis === 0) {
      vertex(this.pos.x, this.minY);
      vertex(this.maxX, this.minY);
      vertex(this.maxX, this.maxY);
      vertex(this.pos.x, this.maxY);
    } else {
      vertex(this.minX, this.pos.y);
      vertex(this.maxX, this.pos.y);
      vertex(this.maxX, this.maxY);
      vertex(this.minX, this.maxY);
    }
    endShape(CLOSE);
    // }
    if (this.right) {
      this.right.displayVertices();
    }
    if (this.left) {
      this.left.displayVertices();
    }
  }

  display() {
    this.updatePos();
    this.colAlpha = lerp(this.colAlpha, 1, 0.1);
    this.colLeft._array[3] = this.colAlpha;
    this.colRight._array[3] = this.colAlpha;
    // this.displayVertices();

    if (lineShow) {
      stroke(0);
    } else {
      noStroke();
    }

    if (this.axis === 0) {
      line(this.pos.x, this.minY, this.pos.x, this.maxY);
    } else {
      line(this.minX, this.pos.y, this.maxX, this.pos.y);
    }

    if (debugMode) {
      fill(0);
      noStroke();
      ellipse(this.pos.x, this.pos.y, 5);
      textSize(16);
      fill(0, 0, 255);
      text(
        `${(this.percentage.x * 100).toFixed(0)}`,
        this.pos.x + textSize() / 2,
        this.pos.y
      );
      fill(255, 0, 0);
      text(
        `${(this.percentage.y * 100).toFixed(0)}`,
        this.pos.x + textSize() / 2,
        this.pos.y + textSize()
      );
    }

    if (this.left) {
      this.left.display();
    }
    if (this.right) {
      this.right.display();
    }

    // if (this.axis === 0) {
    //   fill(0, 255, 0);
    //   ellipse(this.pos.x, this.minY, 10);
    //   ellipse(this.pos.x, this.maxY, 10);
    // } else {
    //   fill(0, 255, 0);
    //   ellipse(this.minX, this.pos.y, 10);
    //   ellipse(this.maxX, this.pos.y, 10);
    // }

    // fill(255, 0, 0);
    // ellipse(this.minX, this.minY, 15);
    // fill(0, 0, 255);
    // ellipse(this.maxX, this.maxY, 15);
  }
}

class KDTree {
  constructor() {
    this.root = null;
  }

  insert(pos, depth = 0, minX = 0, maxX = width, minY = 0, maxY = height) {
    const axis = depth % 2; // 0 : x, 1 : y
    this.root = this.recursiveInsert(
      this.root,
      pos,
      axis,
      minX,
      maxX,
      minY,
      maxY,
      depth
    );
  }

  recursiveInsert(node, pos, axis, minX, maxX, minY, maxY, depth) {
    if (!node) {
      return new Node(pos.x, pos.y, axis, minX, maxX, minY, maxY);
    }

    const currentAxis = node.axis;
    const posKey = axis === 0 ? pos.x : pos.y;
    const nodeKey = axis === 0 ? node.pos.x : node.pos.y;

    if (posKey < nodeKey) {
      if (axis === 0) {
        node.left = this.recursiveInsert(
          node.left,
          pos,
          (currentAxis + 1) % 2,
          minX,
          node.pos.x,
          minY,
          maxY,
          depth + 1
        );
      } else {
        node.left = this.recursiveInsert(
          node.left,
          pos,
          (currentAxis + 1) % 2,
          minX,
          maxX,
          minY,
          node.pos.y,
          depth + 1
        );
      }
    } else {
      if (axis === 0) {
        node.right = this.recursiveInsert(
          node.right,
          pos,
          (currentAxis + 1) % 2,
          node.pos.x,
          maxX,
          minY,
          maxY,
          depth + 1
        );
      } else {
        node.right = this.recursiveInsert(
          node.right,
          pos,
          (currentAxis + 1) % 2,
          minX,
          maxX,
          node.pos.y,
          maxY,
          depth + 1
        );
      }
    }

    return node;
  }

  traverseAllNodes(node, action) {
    if (node) {
      this.traverseAllNodes(node.left, action);
      action(node);
      this.traverseAllNodes(node.right, action);
    }
  }

  display() {
    if (this.root) {
      this.root.display();
      this.root.displayVertices();
    }
  }
}
