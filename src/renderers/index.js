import React from 'react'
import { Map } from 'immutable'
import { DefaultDraftBlockRenderMap } from 'draft-js'
import Image from './atomic/Image'
import Video from './atomic/Video'
import Audio from './atomic/Audio'
import Embed from './atomic/Embed'
import Iframe from './atomic/iframe/Iframe.jsx'
import HorizontalLine from './atomic/HorizontalLine'
import _blockStyleFn from './styles/blockStyles'
import _getCustomStyleMap from './styles/inlineStyles'
import _decorators from './decorators'

const getAtomicBlockComponent = (block, superProps) => (props) => {

  const entityKey = props.block.getEntityAt(0)

  if (!entityKey) {
    return null
  }

  const entity = props.contentState.getEntity(entityKey)
  const mediaData = entity.getData()
  const mediaType = entity.getType()
  const mediaProps = {
    ...superProps,
    block, mediaData, entityKey
  }
  if (mediaType === 'IMAGE') {
    return <Image { ...mediaProps } />
  } else if (mediaType === 'AUDIO') {
    return <Audio { ...mediaProps } />
  } else if (mediaType === 'VIDEO') {
    return <Video { ...mediaProps } />
  } else if (mediaType === 'EMBED') {
    return <Embed { ...mediaProps } />
  } else if (mediaType === 'HR') {
    return <HorizontalLine { ...mediaProps } />
  } else if (mediaType === 'IFRAME') { //扩充 支持第三方分享的iframe
    // return <div><div dangerouslySetInnerHTML={{__html: mediaData.url}} /></div>
    let { url = '' } = mediaProps.mediaData;
    if (url.indexOf('<iframe') !== -1) {
      let re = RegExp(/src=\"([a-zA-z]+:\/\/[^\s]*)\"/);
      console.log(url.replace(re, '$1')); // 拿出iframe中的src部分
      url = RegExp.$1;

      mediaProps.mediaData.url = url;
    }
    return <Iframe { ...mediaProps } />
  }
  // 支持自定义的atomic
  if (superProps.extendAtomics) {
    const atomics = superProps.extendAtomics;
    for (let i = 0; i < atomics.length; i++) {
      if (mediaType === atomics[i].type) {
        const Component = atomics[i].component;
        return <Component {...mediaProps} />
      }
    }
  }

  return null

}

export const getBlockRendererFn = (props) => (block) => {

  return block.getType() === 'atomic' ? {
    component: getAtomicBlockComponent(block, props),
    editable: false
  } : null

}

export const customBlockRenderMap = Map({
  'atomic': {
    element: ''
  },
  'code-block': {
    element: 'code',
    wrapper: DefaultDraftBlockRenderMap.get('code-block').wrapper
  }
})
export const blockStyleFn = _blockStyleFn
export const getCustomStyleMap = _getCustomStyleMap
export const decorators = _decorators