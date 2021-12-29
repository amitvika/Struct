//import * as React from 'react'
import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import NodeElement from './NodeElement';
import LeafElement from './LeafElement';
import { Empty } from './Elements';
import Wrapper from './Wrapper';
import {
  getChildrenByParent,
  getAllAncestorsForCurrentContainers
} from './NodeList';

const MotionContainer = styled(motion.div)`
  min-width: 0;
`;

const MotionDropZone = styled(MotionContainer)``;

const MotionContent = styled(MotionContainer)``;

const MotionChildren = styled(MotionContainer)``;

const Container = (props) => {
  // PROPS
  const {
    nodes,
    parent,
    level,
    selected,
    onSelect,
    currentTheme,
    showEmptyItems,
    iconSet,
    noIcons,
    textures,
    structure,
    disectparts,
    selectitems,
    firstshell,
    secondshell
  } = props;

  // get container items for this level and ancestors for next container
  const _containerItems = getChildrenByParent(nodes, parent);
  const _containerAncestors = getAllAncestorsForCurrentContainers(
    nodes,
    _containerItems
  );

  // STATE
  const [_isOpen, _setIsOpen] = useState(
    Array(_containerItems.length).fill(false)
  ); // keeping track of open folders

  return (
    <MotionContainer parent={parent}>
      <MotionDropZone>
        {!!_containerItems.length &&
          _containerItems.map((item, k) => {
            if (item.leaf) {
              return (
                <LeafElement
                  data={item}
                  key={k}
                  level={level}
                  onSelect={onSelect}
                  selected={selected}
                  currentTheme={currentTheme}
                  noIcons={noIcons}
                  iconSet={iconSet}
                  textures={textures}
                  structure={structure}
                  disectparts={disectparts}
                  selectitems={selectitems}
                  firstshell={firstshell}
                  secondshell={secondshell}
                />
              );
            } else {
              return (
                <MotionContent key={k}>
                  <NodeElement
                    data={item}
                    toggle={() =>
                      _setIsOpen((o) => {
                        const _o = o.slice();
                        _o[k] = !_o[k];
                        return _o;
                      })
                    }
                    onSelect={onSelect}
                    isOpen={_isOpen[k]}
                    isRoot={!parent}
                    level={level}
                    selected={selected}
                    currentTheme={currentTheme}
                    noIcons={noIcons}
                    iconSet={iconSet}
                    textures={textures}
                    structure={structure}
                    disectparts={disectparts}
                    selectitems={selectitems}
                    firstshell={firstshell}
                    secondshell={secondshell}
                  />
                  {_isOpen[k] && (
                    <MotionChildren>
                      <Container
                        parent={item.id}
                        nodes={_containerAncestors[k]}
                        level={level + 1}
                        onSelect={onSelect}
                        selected={selected}
                        currentTheme={currentTheme}
                        showEmptyItems={showEmptyItems}
                        noIcons={noIcons}
                        iconSet={iconSet}
                        textures={textures}
                        structure={structure}
                        disectparts={disectparts}
                        selectitems={selectitems}
                        firstshell={firstshell}
                        secondshell={secondshell}
                      />
                      {item.items &&
                        item.items.map((child, l) => {
                          return (
                            <LeafElement
                              data={child}
                              key={l}
                              level={level}
                              onSelect={onSelect}
                              selected={selected}
                              currentTheme={currentTheme}
                              noIcons={noIcons}
                              iconSet={iconSet}
                              textures={textures}
                              structure={structure}
                              disectparts={disectparts}
                              selectitems={selectitems}
                              firstshell={firstshell}
                              secondshell={secondshell}
                            />
                          );
                        })}
                      {showEmptyItems && !item.items && (
                        <Empty currentTheme={currentTheme}>
                          <Wrapper level={level + 1}>[No items]</Wrapper>
                        </Empty>
                      )}
                    </MotionChildren>
                  )}
                </MotionContent>
              );
            }
          })}
      </MotionDropZone>
    </MotionContainer>
  );
};

Container.defaultProps = {
  nodes: [],
  parent: null,
  level: 0,
  selected: null,
  onSelect: () => {},
  currentTheme: 'dark',
  showEmptyItems: false,
  iconSet: null,
  noIcons: undefined,
  structure: true,
  disectparts: false,
  selectitems: true,
  firstshell: null,
  secondshell: null
};

export default Container;
