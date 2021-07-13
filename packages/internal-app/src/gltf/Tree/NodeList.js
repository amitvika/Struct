export const getAncestorsByParent = (
  nodes,
  currentContainer
) => {
  const foundList = []
  const search = currentParent => {
    nodes.forEach(n => {
      if (
        !foundList.includes(n.id) &&
        n.parentId === currentParent &&
        n.id !== currentParent
      ) {
        foundList.push(n.id)
        search(n.id)
      }
    })
  }
  search(currentContainer.id)

  return nodes.filter(n => foundList.includes(n.id))
}

export const getAllAncestorsForCurrentContainers = (
  nodeList,
  containerItems
) => {
  return containerItems.map(parent => {
    return getAncestorsByParent(nodeList, parent)
  })
}

export const getChildrenByParent = (
  nodes,
  parentId
) => {
  return nodes.filter(n => n.parentId === parentId)
}
