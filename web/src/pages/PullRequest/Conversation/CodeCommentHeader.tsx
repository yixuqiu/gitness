import React, { useEffect } from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Diff2HtmlUI } from 'diff2html/lib-esm/ui/js/diff2html-ui'
import * as Diff2Html from 'diff2html'
import { get } from 'lodash-es'
import type { TypesPullReqActivity } from 'services/code'
import type { CommentItem } from 'components/CommentBox/CommentBox'
import { DIFF2HTML_CONFIG, ViewStyle } from 'components/DiffViewer/DiffViewerUtils'
import { isCodeComment } from '../PullRequestUtils'
import css from './Conversation.module.scss'

interface CodeCommentHeaderProps {
  commentItems: CommentItem<TypesPullReqActivity>[]
  threadId: number | undefined
}

export const CodeCommentHeader: React.FC<CodeCommentHeaderProps> = ({ commentItems, threadId }) => {
  const _isCodeComment = isCodeComment(commentItems)
  const id = `code-comment-snapshot-${threadId}`

  useEffect(() => {
    if (_isCodeComment) {
      // Note: Since payload does not have information about the file path, mode, and index, and we
      // don't render them anyway in the UI, we just use dummy info for them.
      const codeDiffSnapshot = [
        `diff --git a/src b/dest`,
        `new file mode 100644`,
        'index 0000000..0000000',
        '--- a/src',
        '+++ b/dest',
        get(commentItems[0], 'payload.payload.title', ''),
        ...get(commentItems[0], 'payload.payload.lines', [])
      ].join('\n')

      new Diff2HtmlUI(
        document.getElementById(id) as HTMLElement,
        Diff2Html.parse(codeDiffSnapshot, DIFF2HTML_CONFIG),
        Object.assign({}, DIFF2HTML_CONFIG, { outputFormat: ViewStyle.LINE_BY_LINE })
      ).draw()
    }
  }, [id, commentItems, _isCodeComment, threadId])

  return _isCodeComment ? (
    <Container className={css.snapshot}>
      <Layout.Vertical>
        <Container className={css.title}>
          <Text inline className={css.fname}>
            {commentItems[0].payload?.code_comment?.path}
          </Text>
        </Container>
        <Container className={css.snapshotContent} id={id} />
      </Layout.Vertical>
    </Container>
  ) : null
}
