const express = require('express');
const router = express.Router();

// --- Sorting Algorithms Implementation ---
function bubbleSort(arr) {
  const steps = [];
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = a.length;

  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Initial state' });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      let swapped = false;
      if (a[j] > a[j + 1]) {
        const temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
        swaps++;
        swapped = true;
      }
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapped,
        description: `Compare indices ${j} & ${j + 1}: ${swapped ? 'Swapped' : 'No swap'}`
      });
    }
  }
  return { result: a, steps, comparisons, swaps };
}

function selectionSort(arr) {
  const steps = [];
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = a.length;

  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Initial state' });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
      steps.push({
        array: [...a],
        comparing: [minIdx, j],
        swapped: false,
        description: `Scanning index ${j}, current minimum at ${minIdx}`
      });
    }
    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
      swaps++;
      steps.push({
        array: [...a],
        comparing: [i, minIdx],
        swapped: true,
        description: `Swapped index ${i} with minimum at ${minIdx}`
      });
    }
  }
  return { result: a, steps, comparisons, swaps };
}

function insertionSort(arr) {
  const steps = [];
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = a.length;

  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Initial state' });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      if (a[j] > key) {
        a[j + 1] = a[j];
        swaps++;
        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          swapped: true,
          description: `Shifted element from ${j} to ${j + 1}`
        });
        j--;
      } else {
        break;
      }
    }
    a[j + 1] = key;
    steps.push({
      array: [...a],
      comparing: [j + 1],
      swapped: false,
      description: `Placed key ${key} at index ${j + 1}`
    });
  }
  return { result: a, steps, comparisons, swaps };
}

function mergeSort(arr) {
  const steps = [];
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;

  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Initial state' });

  function merge(low, mid, high) {
    const temp = [];
    let i = low;
    let j = mid + 1;

    while (i <= mid && j <= high) {
      comparisons++;
      if (a[i] <= a[j]) {
        temp.push(a[i++]);
      } else {
        temp.push(a[j++]);
      }
    }
    while (i <= mid) temp.push(a[i++]);
    while (j <= high) temp.push(a[j++]);

    for (let k = 0; k < temp.length; k++) {
      if (a[low + k] !== temp[k]) {
        swaps++;
      }
      a[low + k] = temp[k];
    }

    steps.push({
      array: [...a],
      comparing: [low, high],
      swapped: true,
      description: `Merged sub-array from index ${low} to ${high}`
    });
  }

  function sort(low, high) {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      sort(low, mid);
      sort(mid + 1, high);
      merge(low, mid, high);
    }
  }

  if (a.length > 0) sort(0, a.length - 1);
  return { result: a, steps, comparisons, swaps };
}

function quickSort(arr) {
  const steps = [];
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;

  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Initial state' });

  function partition(low, high) {
    const pivot = a[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      if (a[j] < pivot) {
        i++;
        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
        swaps++;
        steps.push({
          array: [...a],
          comparing: [i, j],
          swapped: true,
          description: `Partition: Swapped ${a[i]} and ${a[j]}`
        });
      }
    }
    const temp = a[i + 1];
    a[i + 1] = a[high];
    a[high] = temp;
    swaps++;
    steps.push({
      array: [...a],
      comparing: [i + 1, high],
      swapped: true,
      description: `Pivot ${pivot} placed at index ${i + 1}`
    });
    return i + 1;
  }

  function sort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  if (a.length > 0) sort(0, a.length - 1);
  return { result: a, steps, comparisons, swaps };
}

function heapSort(arr) {
  const steps = [];
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = a.length;

  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Initial state' });

  function heapify(size, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      comparisons++;
      if (a[left] > a[largest]) largest = left;
    }
    if (right < size) {
      comparisons++;
      if (a[right] > a[largest]) largest = right;
    }

    if (largest !== i) {
      const temp = a[i];
      a[i] = a[largest];
      a[largest] = temp;
      swaps++;
      steps.push({
        array: [...a],
        comparing: [i, largest],
        swapped: true,
        description: `Heapify: Swapped ${a[i]} and ${a[largest]}`
      });
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    const temp = a[0];
    a[0] = a[i];
    a[i] = temp;
    swaps++;
    steps.push({
      array: [...a],
      comparing: [0, i],
      swapped: true,
      description: `Moved maximum element to end index ${i}`
    });
    heapify(i, 0);
  }

  return { result: a, steps, comparisons, swaps };
}

// POST /dsa/sort
router.post('/sort', (req, res) => {
  const { algorithm = 'bubble', data = [] } = req.body;
  const start = process.hrtime();

  let sortRes;
  switch (algorithm.toLowerCase()) {
    case 'selection':
      sortRes = selectionSort(data);
      break;
    case 'insertion':
      sortRes = insertionSort(data);
      break;
    case 'merge':
      sortRes = mergeSort(data);
      break;
    case 'quick':
      sortRes = quickSort(data);
      break;
    case 'heap':
      sortRes = heapSort(data);
      break;
    case 'bubble':
    default:
      sortRes = bubbleSort(data);
      break;
  }

  const diff = process.hrtime(start);
  const time_ms = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

  return res.json({
    algorithm,
    result: sortRes.result,
    steps: sortRes.steps,
    comparisons: sortRes.comparisons,
    swaps: sortRes.swaps,
    time_ms: parseFloat(time_ms)
  });
});

// POST /dsa/search
router.post('/search', (req, res) => {
  const { algorithm = 'linear', data = [], target } = req.body;
  const steps = [];
  let found = false;
  let index = -1;

  if (algorithm.toLowerCase() === 'binary') {
    let low = 0;
    let high = data.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      steps.push({
        index: mid,
        value: data[mid],
        range: [low, high],
        description: `Inspecting mid index ${mid} (value ${data[mid]}) in range [${low}, ${high}]`
      });

      if (data[mid] === target) {
        found = true;
        index = mid;
        break;
      } else if (data[mid] < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  } else {
    // Linear search
    for (let i = 0; i < data.length; i++) {
      steps.push({
        index: i,
        value: data[i],
        description: `Checking index ${i} with value ${data[i]}`
      });
      if (data[i] === target) {
        found = true;
        index = i;
        break;
      }
    }
  }

  return res.json({
    algorithm,
    found,
    index,
    steps,
    result: found ? index : -1
  });
});

// --- In-Memory State for Data Structures Lab ---
let demoQueue = [10, 20, 30];
let demoStack = [15, 25, 35];

class BSTNode {
  constructor(val) {
    this.value = val;
    this.left = null;
    this.right = null;
  }
}

class DemoBST {
  constructor() {
    this.root = null;
    [50, 30, 70, 20, 40, 60, 80].forEach(v => this.insert(v));
  }

  insert(val) {
    const newNode = new BSTNode(val);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let cur = this.root;
    while (true) {
      if (val < cur.value) {
        if (!cur.left) {
          cur.left = newNode;
          break;
        }
        cur = cur.left;
      } else if (val > cur.value) {
        if (!cur.right) {
          cur.right = newNode;
          break;
        }
        cur = cur.right;
      } else {
        break; // Duplicate
      }
    }
  }

  search(val) {
    const path = [];
    let cur = this.root;
    while (cur) {
      path.push(cur.value);
      if (cur.value === val) return { found: true, path };
      if (val < cur.value) cur = cur.left;
      else cur = cur.right;
    }
    return { found: false, path };
  }

  serialize(node = this.root) {
    if (!node) return null;
    return {
      value: node.value,
      left: this.serialize(node.left),
      right: this.serialize(node.right)
    };
  }
}

let demoBST = new DemoBST();
let demoLinkedList = [
  { id: 1, value: 'Node 1', next: 2 },
  { id: 2, value: 'Node 2', next: 3 },
  { id: 3, value: 'Node 3', next: null }
];
let nextLLId = 4;

// Queue routes
router.get('/queue/state', (req, res) => {
  res.json({ queue: demoQueue, size: demoQueue.length });
});

router.post('/queue/enqueue', (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ detail: 'Value is required' });
  demoQueue.push(value);
  res.json({ message: 'Enqueued', queue: demoQueue, size: demoQueue.length });
});

router.post('/queue/dequeue', (req, res) => {
  if (demoQueue.length === 0) return res.status(400).json({ detail: 'Queue is empty' });
  const item = demoQueue.shift();
  res.json({ message: 'Dequeued', item, queue: demoQueue, size: demoQueue.length });
});

// Stack routes
router.get('/stack/state', (req, res) => {
  res.json({ stack: demoStack, size: demoStack.length });
});

router.post('/stack/push', (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ detail: 'Value is required' });
  demoStack.push(value);
  res.json({ message: 'Pushed', stack: demoStack, size: demoStack.length });
});

router.post('/stack/pop', (req, res) => {
  if (demoStack.length === 0) return res.status(400).json({ detail: 'Stack is empty' });
  const item = demoStack.pop();
  res.json({ message: 'Popped', item, stack: demoStack, size: demoStack.length });
});

// BST routes
router.get('/bst/state', (req, res) => {
  res.json({ tree: demoBST.serialize() });
});

router.post('/bst/insert', (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ detail: 'Value is required' });
  demoBST.insert(Number(value));
  res.json({ message: 'Inserted', tree: demoBST.serialize() });
});

router.post('/bst/search', (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ detail: 'Value is required' });
  const outcome = demoBST.search(Number(value));
  res.json(outcome);
});

// Linked List routes
router.get('/linkedlist/state', (req, res) => {
  res.json({ nodes: demoLinkedList, head: demoLinkedList.length > 0 ? demoLinkedList[0].id : null });
});

router.post('/linkedlist/insert', (req, res) => {
  const { value, position } = req.body;
  if (value === undefined) return res.status(400).json({ detail: 'Value is required' });

  const newNode = { id: nextLLId++, value, next: null };
  const pos = position !== undefined ? parseInt(position, 10) : demoLinkedList.length;

  if (pos <= 0 || demoLinkedList.length === 0) {
    if (demoLinkedList.length > 0) newNode.next = demoLinkedList[0].id;
    demoLinkedList.unshift(newNode);
  } else if (pos >= demoLinkedList.length) {
    demoLinkedList[demoLinkedList.length - 1].next = newNode.id;
    demoLinkedList.push(newNode);
  } else {
    newNode.next = demoLinkedList[pos].id;
    demoLinkedList[pos - 1].next = newNode.id;
    demoLinkedList.splice(pos, 0, newNode);
  }

  res.json({ message: 'Node inserted', nodes: demoLinkedList });
});

router.post('/linkedlist/delete', (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ detail: 'Value is required' });

  const idx = demoLinkedList.findIndex(n => n.value == value);
  if (idx === -1) return res.status(404).json({ detail: 'Node with given value not found' });

  if (idx > 0 && idx < demoLinkedList.length - 1) {
    demoLinkedList[idx - 1].next = demoLinkedList[idx + 1].id;
  } else if (idx > 0 && idx === demoLinkedList.length - 1) {
    demoLinkedList[idx - 1].next = null;
  }
  demoLinkedList.splice(idx, 1);

  res.json({ message: 'Node deleted', nodes: demoLinkedList });
});

module.exports = router;
