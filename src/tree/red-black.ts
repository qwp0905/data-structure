// enum NodeType {
//   red,
//   black
// }

// class Node<T> {
//   left: Node<T> | null = null
//   right: Node<T> | null = null

//   constructor(
//     public type: NodeType,
//     public value: T
//   ) {}

//   isLeaf() {
//     return this.left === null && this.right === null && this.type === NodeType.black
//   }

//   insert(v: T) {
//     if (this.value === v) {
//       return
//     }

//     if (v < this.value) {
//       if (!this.left) {
//         this.left = new Node(NodeType.red, v)
//       } else {
//         this.left.insert(v)
//       }
//       if (this.type === NodeType.red) {
//         if (this.left.type === NodeType.red) {
//           // restructuring
//         } else {
//           // recoloring
//         }
//       }
//     } else {
//       if (!this.right) {
//         this.right = new Node(NodeType.red, v)
//       } else {
//         this.right.insert(v)
//       }
//       if (this.type === NodeType.red) {
//         if (this.right.type === NodeType.red) {
//           // restructuring
//         } else {
//           // recoloring
//         }
//       }
//     }
//   }

//   private restructuring() {}
// }

// export class RedBlackTree<T> {
//   private root: Node<T> | null = null

//   insert(v: T) {
//     if (!this.root) {
//       this.root = new Node(NodeType.black, v)
//       return
//     }
//   }
// }
