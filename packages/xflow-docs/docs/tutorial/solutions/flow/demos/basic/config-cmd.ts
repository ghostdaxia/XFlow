import { createCmdConfig, DisposableCollection, NsGraphCmd, XFlowGraphCommands } from '@antv/xflow'
import { FrontendApplication } from '@antv/xflow'
import { IGraphPipelineCommand } from '@antv/xflow'
import { MockApi } from './service'
import { commandContributions } from './cmd-extensions'
export const useCmdConfig = createCmdConfig(config => {
  // 注册全局Command扩展
  config.setCommandContributions(() => commandContributions)
  // 设置hook
  config.setRegisterHookFn(hooks => {
    const list = [
      hooks.graphMeta.registerHook({
        name: 'get node config from backend api',
        handler: async args => {
          args.graphMetaService = MockApi.queryGraphMeta
        },
      }),
      hooks.saveGrpahData.registerHook({
        name: 'get node config from backend api',
        handler: async args => {
          if (!args.saveGraphDataService) {
            args.saveGraphDataService = MockApi.saveGraphData
          }
        },
      }),
      hooks.addNode.registerHook({
        name: 'get node config from backend api',
        handler: async args => {
          args.createNodeService = MockApi.addNode
        },
      }),
      hooks.delNode.registerHook({
        name: 'get edge config from backend api',
        handler: async args => {
          args.deleteNodeService = MockApi.delNode
        },
      }),
      hooks.addEdge.registerHook({
        name: 'get edge config from backend api',
        handler: async args => {
          args.createEdgeService = MockApi.addEdge
        },
      }),
      hooks.delEdge.registerHook({
        name: 'get edge config from backend api',
        handler: async args => {
          args.deleteEdgeService = MockApi.delEdge
        },
      }),
    ]
    const toDispose = new DisposableCollection()
    toDispose.pushAll(list)
    return toDispose
  })
})

/** 查询图的节点和边的数据 */
export const initGraphCmds = (app: FrontendApplication) => {
  app.executeCommandPipeline([
    /** 1. 从服务端获取数据 */
    {
      commandId: XFlowGraphCommands.LOAD_DATA.id,
      getCommandOption: async ctx => {
        return {
          args: {
            loadDataService: MockApi.loadGraphData,
          },
        }
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphLoadData.IArgs>,
    /** 2. 画布内容渲染 */
    {
      commandId: XFlowGraphCommands.GRAPH_RENDER.id,
      getCommandOption: async ctx => {
        const { graphData } = ctx.getResult()
        return {
          args: {
            graphData,
          },
        }
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphRender.IArgs>,
  ])
}