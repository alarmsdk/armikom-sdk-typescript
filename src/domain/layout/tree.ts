/**
 * Tree operations on a layout document.
 *
 * Every gesture in the designer reduces to one of these: dropping a panel on the left edge
 * of another is `wrapWithSplit` + `insertAt`; dragging a tab out is `remove` + `insertAt`;
 * deleting the last child of a split is `remove` + `normalize`. Keeping the algebra in one
 * pure module is what makes undo/redo a matter of keeping snapshots, and what lets the
 * outline tree and the drag-and-drop canvas drive exactly the same edits.
 *
 * All functions are pure: they take a node and return a new node. Nothing mutates the
 * document in place, so a snapshot taken before an edit stays valid after it.
 */
import {
  type LayoutNode,
  type ContainerNode,
  type SplitNode,
  type TabsNode,
  type PanelNode,
  type LayoutDirection,
  type ScreenLayout,
  isContainer,
  isSplit,
  isTabs,
  isPanel,
  newNodeKey
} from './types.js'

// ── Reading ──────────────────────────────────────────────────────────────────

export function cloneNode<T extends LayoutNode>(node: T): T {
  return JSON.parse(JSON.stringify(node)) as T
}

export function findNode(root: LayoutNode, key: string): LayoutNode | null {
  if (root.key === key) return root
  if (!isContainer(root)) return null
  for (const child of root.children) {
    const hit = findNode(child, key)
    if (hit) return hit
  }
  return null
}

export function findParent(root: LayoutNode, key: string): ContainerNode | null {
  if (!isContainer(root)) return null
  for (const child of root.children) {
    if (child.key === key) return root
    const hit = findParent(child, key)
    if (hit) return hit
  }
  return null
}

/** Root-to-node path, inclusive at both ends. Empty when the key is not in the tree. */
export function findPath(root: LayoutNode, key: string): LayoutNode[] {
  if (root.key === key) return [root]
  if (!isContainer(root)) return []
  for (const child of root.children) {
    const sub = findPath(child, key)
    if (sub.length) return [root, ...sub]
  }
  return []
}

export function collectPanels(root: LayoutNode): PanelNode[] {
  if (isPanel(root)) return [root]
  if (!isContainer(root)) return []
  return root.children.flatMap(collectPanels)
}

/** Every node in the tree, parents before children. */
export function walk(root: LayoutNode): LayoutNode[] {
  if (!isContainer(root)) return [root]
  return [root, ...root.children.flatMap(walk)]
}

export function findPanelNode(root: LayoutNode, panelId: string): PanelNode | null {
  return collectPanels(root).find((p) => p.panelId === panelId) ?? null
}

// ── Writing ──────────────────────────────────────────────────────────────────

/** Rebuilds the tree with `key` replaced by whatever `fn` returns; `null` removes it. */
function rewrite(node: LayoutNode, key: string, fn: (n: LayoutNode) => LayoutNode | null): LayoutNode | null {
  if (node.key === key) return fn(node)
  if (!isContainer(node)) return node

  let changed = false
  const nextChildren: LayoutNode[] = []
  for (const child of node.children) {
    const next = rewrite(child, key, fn)
    if (next !== child) changed = true
    if (next) nextChildren.push(next)
  }
  if (!changed) return node

  // Sizes are positional, so a removal has to drop the matching entry rather than leave the
  // array misaligned with the children it describes.
  let sizes = isSplit(node) ? node.sizes : undefined
  if (isSplit(node) && sizes && nextChildren.length !== node.children.length) {
    const kept = node.children
      .map((c, i) => ({ key: c.key, size: sizes![i] as number }))
      .filter((entry) => nextChildren.some((c) => c.key === entry.key))
    sizes = kept.length === nextChildren.length ? kept.map((e) => e.size) : undefined
  }

  return { ...node, children: nextChildren, ...(isSplit(node) ? { sizes } : {}) } as LayoutNode
}

export function replaceNode(root: LayoutNode, key: string, next: LayoutNode): LayoutNode {
  return rewrite(root, key, () => next) ?? root
}

export function updateNode<T extends LayoutNode>(
  root: LayoutNode,
  key: string,
  patch: Partial<T>
): LayoutNode {
  return rewrite(root, key, (n) => ({ ...n, ...patch }) as LayoutNode) ?? root
}

/** Removes a node. Returns the root unchanged when the key is the root itself. */
export function removeNode(root: LayoutNode, key: string): LayoutNode {
  if (root.key === key) return root
  const next = rewrite(root, key, () => null)
  return normalize(next ?? root)
}

/** Inserts `node` into `parentKey` at `index` (appended when the index is out of range). */
export function insertAt(
  root: LayoutNode,
  parentKey: string,
  node: LayoutNode,
  index: number
): LayoutNode {
  return rewrite(root, parentKey, (parent) => {
    if (!isContainer(parent)) return parent
    const children = [...parent.children]
    const at = Math.max(0, Math.min(index, children.length))
    children.splice(at, 0, node)

    let sizes = isSplit(parent) ? parent.sizes : undefined
    if (isSplit(parent) && sizes) {
      // The newcomer takes an equal share, and the rest are scaled down to make room.
      const share = 100 / children.length
      const scale = (100 - share) / 100
      const next = sizes.map((s) => s * scale)
      next.splice(at, 0, share)
      sizes = next
    }

    return { ...parent, children, ...(isSplit(parent) ? { sizes } : {}) } as LayoutNode
  }) ?? root
}

/**
 * Wraps `targetKey` in a new split and puts `node` beside it — the drop-on-an-edge gesture.
 * `side` says where the newcomer lands relative to the target.
 */
export function wrapWithSplit(
  root: LayoutNode,
  targetKey: string,
  node: LayoutNode,
  side: 'left' | 'right' | 'top' | 'bottom'
): LayoutNode {
  const dir: LayoutDirection = side === 'left' || side === 'right' ? 'row' : 'col'
  const before = side === 'left' || side === 'top'

  const wrapped = rewrite(root, targetKey, (target) => {
    // The target is now a child sharing the wrapper's box, so its own flex moves up to the
    // wrapper — otherwise wrapping a fixed-width column would make it stretch.
    const inner = { ...target, flex: undefined }
    const split: SplitNode = {
      key: newNodeKey('s'),
      type: 'split',
      dir,
      sizes: [50, 50],
      children: before ? [node, inner] : [inner, node],
      flex: target.flex
    }
    return split
  })

  return normalize(wrapped ?? root)
}

/** Turns a panel into a tab group holding it, so the next drop can join it as a sibling tab. */
export function wrapWithTabs(root: LayoutNode, targetKey: string, node: LayoutNode): LayoutNode {
  const wrapped = rewrite(root, targetKey, (target) => {
    if (isTabs(target)) {
      return { ...target, children: [...target.children, node], active: node.key }
    }
    const tabs: TabsNode = {
      key: newNodeKey('t'),
      type: 'tabs',
      children: [{ ...target, flex: undefined }, node],
      active: node.key,
      flex: target.flex
    }
    return tabs
  })
  return normalize(wrapped ?? root)
}

/**
 * Puts a node inside a tab group by itself. `wrapWithTabs` needs a newcomer to justify the
 * group; this is the designer's "make this a tab group" button, where the second tab arrives
 * later by drag. `normalize` would collapse a one-child group, so this deliberately does not
 * run it — the caller commits the node as-is.
 */
export function wrapInTabs(root: LayoutNode, targetKey: string): LayoutNode {
  return rewrite(root, targetKey, (target) => {
    if (isTabs(target)) return target
    return {
      key: newNodeKey('t'),
      type: 'tabs',
      children: [{ ...target, flex: undefined }],
      active: target.key,
      flex: target.flex
    } as TabsNode
  }) ?? root
}

/** Replaces a container with its only child — the cleanup after a removal. */
export function unwrap(root: LayoutNode, key: string): LayoutNode {
  const next = rewrite(root, key, (n) => {
    if (!isContainer(n) || n.children.length !== 1) return n
    const only = n.children[0] as LayoutNode
    return { ...only, flex: n.flex ?? only.flex }
  })
  return next ?? root
}

/**
 * Moves an existing node somewhere else in one step. Removing first and inserting after
 * would be wrong when the destination is described relative to a node that the removal
 * normalises away, so the removal is done on a tree that still carries the destination.
 */
export function moveNode(
  root: LayoutNode,
  sourceKey: string,
  destination:
    | { kind: 'into'; parentKey: string; index: number }
    | { kind: 'beside'; targetKey: string; side: 'left' | 'right' | 'top' | 'bottom' }
    | { kind: 'tab'; targetKey: string }
): LayoutNode {
  const source = findNode(root, sourceKey)
  if (!source) return root

  const destinationKey = destination.kind === 'into' ? destination.parentKey : destination.targetKey
  // Refuse to drop a node inside itself — the gesture is possible, the result is not a tree.
  if (destinationKey === sourceKey) return root
  if (findNode(source, destinationKey)) return root

  const detached = cloneNode(source)
  // Detached without normalising, so a container the source leaves with one child keeps its
  // key until the insert is done. That is what lets a tab be dragged out of a two-tab group
  // and dropped above that same group: normalising first would collapse the group and take
  // the destination with it. Each operation below normalises the finished tree.
  const withoutSource = rewrite(root, sourceKey, () => null) ?? root

  // Defensive: nothing above removes the destination any more, but a node must never be
  // dropped on the floor, so a missing destination still falls back to the root.
  if (!findNode(withoutSource, destinationKey)) {
    const rootKey = withoutSource.key
    return isContainer(withoutSource)
      ? normalize(insertAt(withoutSource, rootKey, detached, withoutSource.children.length))
      : wrapWithSplit(withoutSource, rootKey, detached, 'right')
  }

  switch (destination.kind) {
    case 'into':
      return normalize(insertAt(withoutSource, destination.parentKey, detached, destination.index))
    case 'beside':
      return wrapWithSplit(withoutSource, destination.targetKey, detached, destination.side)
    case 'tab':
      return wrapWithTabs(withoutSource, destination.targetKey, detached)
  }
}

/** Reorders a child within its parent — dragging a tab along its own tab bar. */
export function reorderChild(root: LayoutNode, parentKey: string, from: number, to: number): LayoutNode {
  return rewrite(root, parentKey, (parent) => {
    if (!isContainer(parent)) return parent
    const children = [...parent.children]
    if (from < 0 || from >= children.length) return parent
    const [moved] = children.splice(from, 1)
    children.splice(Math.max(0, Math.min(to, children.length)), 0, moved as LayoutNode)

    let sizes = isSplit(parent) ? parent.sizes : undefined
    if (isSplit(parent) && sizes) {
      const next = [...sizes]
      const [s] = next.splice(from, 1)
      next.splice(Math.max(0, Math.min(to, next.length)), 0, s as number)
      sizes = next
    }
    return { ...parent, children, ...(isSplit(parent) ? { sizes } : {}) } as LayoutNode
  }) ?? root
}

// ── Normalisation ────────────────────────────────────────────────────────────

/**
 * Puts the tree back into canonical form after an edit:
 *   · a container with one child is replaced by that child
 *   · a split directly inside a split of the same direction is flattened
 *   · a tab group's `active` is repaired when it points at a child that left
 *   · `sizes` arrays that no longer match their children are dropped
 *
 * Without this, a few drags leave a tree of nested single-child splits that renders the same
 * but is impossible to reason about in the outline — and that operators would then inherit.
 */
export function normalize(node: LayoutNode): LayoutNode {
  if (!isContainer(node)) return node

  let children = node.children.map(normalize)

  // Flatten same-direction nesting.
  if (isSplit(node)) {
    const flattened: LayoutNode[] = []
    for (const child of children) {
      if (isSplit(child) && child.dir === node.dir && child.flex === undefined) {
        flattened.push(...child.children)
      } else {
        flattened.push(child)
      }
    }
    children = flattened
  }

  if (children.length === 1) {
    const only = children[0] as LayoutNode
    return { ...only, flex: node.flex ?? only.flex }
  }

  if (isSplit(node)) {
    const sizes = node.sizes && node.sizes.length === children.length ? node.sizes : undefined
    return { ...node, children, sizes }
  }

  const active = children.some((c) => c.key === node.active) ? node.active : children[0]?.key
  return { ...node, children, active }
}

// ── Document helpers ─────────────────────────────────────────────────────────

export function withRoot(layout: ScreenLayout, root: LayoutNode): ScreenLayout {
  return { ...layout, root: normalize(root) }
}

/** A fresh panel node, ready to be dropped into the tree. */
export function makePanelNode(panelId: string, title?: string): PanelNode {
  return { key: newNodeKey('p'), type: 'panel', panelId, ...(title ? { title } : {}) }
}

export function makeTabsNode(children: LayoutNode[] = [], title?: string): TabsNode {
  return {
    key: newNodeKey('t'),
    type: 'tabs',
    children,
    active: children[0]?.key,
    ...(title ? { title } : {})
  }
}

export function makeSplitNode(dir: LayoutDirection, children: LayoutNode[] = []): SplitNode {
  return { key: newNodeKey('s'), type: 'split', dir, children }
}
