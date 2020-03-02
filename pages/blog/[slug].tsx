import styled from 'styled-components'
import { NextSeo } from 'next-seo'

import { formatDate } from '../../utils'
import {
  Layout,
  Hero,
  Wrapper,
  MarkdownContent,
  RichTextWrapper,
} from '../../components/layout'
import {
  InlineWysiwyg,
  InlineTextareaField,
  InlineTextField,
} from '../../components/ui/inline'
import { getGithubDataFromPreviewProps } from '../../utils/github/sourceProviderConnection'
import getMarkdownData from '../../utils/github/getMarkdownData'
import { useLocalGithubMarkdownForm } from '../../utils/github/useLocalGithubMarkdownForm'
import { fileToUrl } from '../../utils/urls'
import OpenAuthoringSiteForm from '../../components/layout/OpenAuthoringSiteForm'
import ContentNotFoundError from '../../utils/github/ContentNotFoundError'
const fg = require('fast-glob')

export default function BlogTemplate({
  markdownFile,
  sourceProviderConnection,
  siteConfig,
  editMode,
  previewError,
}) {
  //workaround for fallback being not implemented
  if (!markdownFile) {
    return <div></div>
  }

  // Registers Tina Form
  const [data, form] = useLocalGithubMarkdownForm(
    markdownFile,
    formOptions,
    sourceProviderConnection,
    editMode
  )

  const frontmatter = data.frontmatter
  const markdownBody = data.markdownBody
  const excerpt = data.excerpt

  return (
    <OpenAuthoringSiteForm
      form={form}
      editMode={editMode}
      previewError={previewError}
    >
      <Layout
        sourceProviderConnection={sourceProviderConnection}
        editMode={editMode}
      >
        <NextSeo
          title={frontmatter.title}
          titleTemplate={'%s | ' + siteConfig.title + ' Blog'}
          description={excerpt}
          openGraph={{
            title: frontmatter.title,
            description: excerpt,
            images: [
              {
                url:
                  'https://res.cloudinary.com/forestry-demo/image/upload/l_text:tuner-regular.ttf_70:' +
                  encodeURI(frontmatter.title) +
                  ',g_north_west,x_270,y_95,w_840,c_fit,co_rgb:EC4815/l_text:tuner-regular.ttf_35:' +
                  encodeURI(frontmatter.author) +
                  ',g_north_west,x_270,y_500,w_840,c_fit,co_rgb:241748/v1581087220/TinaCMS/tinacms-social-empty.png',
                width: 1200,
                height: 628,
                alt: frontmatter.title + ` | TinaCMS Blog`,
              },
            ],
          }}
        />
        <Hero>
          <InlineTextareaField name="frontmatter.title" />
        </Hero>
        <BlogWrapper>
          {/*
           *** Inline controls shouldn't render
           *** until we're ready for Inline release
           */}
          {/*
            <InlineControls>
            <EditToggle />
            <DiscardButton />
            </InlineControls>
          */}
          <RichTextWrapper>
            <BlogMeta>
              <p>
                <span>By: </span>
                <InlineTextField name="frontmatter.author" />
              </p>
              <p>{formatDate(frontmatter.date)}</p>
            </BlogMeta>
            <InlineWysiwyg name="markdownBody">
              <MarkdownContent escapeHtml={false} content={markdownBody} />
            </InlineWysiwyg>
          </RichTextWrapper>
        </BlogWrapper>
      </Layout>
    </OpenAuthoringSiteForm>
  )
}

/*
 ** DATA FETCHING --------------------------------------------------
 */

export async function unstable_getStaticProps({
  preview,
  previewData,
  ...ctx
}) {
  const { slug } = ctx.params

  const sourceProviderConnection = getGithubDataFromPreviewProps(previewData)

  let previewError: string
  let file = {}
  try {
    file = await getMarkdownData(
      `content/blog/${slug}.md`,
      sourceProviderConnection
    )
  } catch (e) {
    if (e instanceof ContentNotFoundError) {
      previewError = e.message
    } else {
      throw e
    }
  }

  //TODO - move to readFile
  const siteConfig = await import('../../content/siteConfig.json')

  return {
    props: {
      sourceProviderConnection,
      editMode: !!preview,
      previewError: previewError,
      siteConfig: {
        title: siteConfig.title,
      },
      markdownFile: file,
    },
  }
}

export async function unstable_getStaticPaths() {
  const blogs = await fg(`./content/blog/**/*.md`)
  return {
    paths: blogs.map(file => {
      const slug = fileToUrl(file, 'blog')
      return { params: { slug } }
    }),
  }
}

/*
 ** TINA FORM CONFIG --------------------------------------------------
 */

const formOptions = {
  label: 'Blog Post',
  fields: [
    {
      label: 'Title',
      name: 'frontmatter.title',
      component: 'text',
    },
    {
      label: 'Author',
      name: 'frontmatter.author',
      component: 'text',
    },
    /*
     ** TODO: add this back in once
     ** draft functionality works again
     */
    // {
    //   name: 'frontmatter.draft',
    //   component: 'toggle',
    //   label: 'Draft',
    // },
    {
      label: 'Date Posted',
      name: 'frontmatter.date',
      component: 'date',
      dateFormat: 'MMMM DD YYYY',
      timeFormat: false,
    },
    {
      label: 'Blog Body',
      name: 'markdownBody',
      component: 'markdown',
    },
  ],
}

/*
 ** STYLES ---------------------------------------------------------
 */

const BlogWrapper = styled(Wrapper)`
  padding-top: 4rem;
  padding-bottom: 3rem;
  max-width: 768px;

  h1,
  .h1,
  h2,
  .h2 {
    color: var(--color-primary);
    em {
      color: var(--color-primary);
      font-style: italic;
    }
  }

  h3,
  .h3,
  h4,
  .h4 {
    color: var(--color-secondary);
    em {
      color: var(--color-secondary);
      font-style: italic;
    }
  }

  h1,
  .h1 {
    font-size: 2rem;
    @media (min-width: 800px) {
      font-size: 3rem;
    }

    @media (min-width: 1200px) {
      font-size: 2.5rem;
    }
  }

  h2,
  .h2 {
    font-size: 1.625rem;
  }
`

const BlogMeta = styled.div`
  width: 100%;
  justify-content: space-between;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  margin-bottom: 1.5rem;
  margin-top: -0.5rem;
  opacity: 0.5;
  p {
    margin: 0;
    color: 0;
    display: block;
  }
  span {
    opacity: 0.5;
  }

  @media (min-width: 550px) {
    flex-direction: row;
  }
`
