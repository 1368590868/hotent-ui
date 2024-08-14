import Vue from 'vue'
import badge from './badge'
import copy from './copy'
import ellipsis from './ellipsis'
import expandClick from './expandClick'
import express from './express'
import form from './form'
import format from './format'
import permit from './permit'
import popconfirm from './popconfirm'
import resize from './resize'
import tooltip from './tooltip'
import tableDrag from './tableDrag'
import subSort from './subSort'
import permissionLine from './permissionLine'
import permissionLineLable from './permissionLineLable'
import relatedQuery from './relatedQuery'
import { formula, Formulas } from './formulas'

const directives = {
  badge,
  copy,
  ellipsis,
  expandClick,
  express,
  form,
  format,
  permit,
  popconfirm,
  resize,
  tooltip,
  subSort,
  permissionLine,
  permissionLineLable,
  formula,
  tableDrag,
  relatedQuery,
}

Object.keys(directives).forEach((name) => Vue.directive(name, directives[name]))

Vue.use(Formulas)
