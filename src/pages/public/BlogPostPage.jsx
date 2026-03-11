import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock3 } from 'lucide-react';
import ProductsCardAll from '../../components/products/ProductsCardAll';
import RichContent from '../../components/content/RichContent';
import { normalizeProduct } from '../../hooks/useApi';
import { blogAPI, productAPI } from '../../services/api';
import { useInitialData } from '../../ssr/initial-data';
import {
  buildBlogExcerpt,
  formatBlogDate,
  getReadingTimeLabel,
  normalizeBlogPost,
} from '../../utils/blog';

const getResponseItems = (response) => response?.data?.data?.items || response?.data?.items || [];
const getResponseData = (response) => response?.data?.data || response?.data || null;

const BlogPostPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const initialData = useInitialData();
  const initialRouteData = initialData?.routeType === 'blog-post'
    && initialData.routeParams?.slug === slug
    ? initialData.routeData
    : null;
  const notFoundFromSSR = initialData?.routeType === 'not-found'
    && initialData?.pathname === location.pathname;

  const [post, setPost] = useState(() => initialRouteData?.post || null);
  const [linkedProducts, setLinkedProducts] = useState(() => initialRouteData?.linkedProducts || []);
  const [recentPosts, setRecentPosts] = useState(() => initialRouteData?.recentPosts || []);
  const [loading, setLoading] = useState(() => !(initialRouteData || notFoundFromSSR));

  useEffect(() => {
    if (initialRouteData || notFoundFromSSR) {
      return;
    }

    const loadPost = async () => {
      setLoading(true);
      try {
        const postResponse = await blogAPI.getPostBySlug(slug);
        const loadedPost = normalizeBlogPost(getResponseData(postResponse));
        setPost(loadedPost);

        const [productsResponse, recentPostsResponse] = await Promise.all([
          loadedPost.linkedProductIds.length > 0
            ? productAPI.getProducts({
                ids: loadedPost.linkedProductIds.join(','),
                active: 'true',
                page: '1',
                limit: String(loadedPost.linkedProductIds.length),
              })
            : Promise.resolve(null),
          blogAPI.getPosts({ page: '1', limit: '4' }),
        ]);

        setLinkedProducts(productsResponse ? getResponseItems(productsResponse).map((product) => normalizeProduct(product)) : []);
        setRecentPosts(
          getResponseItems(recentPostsResponse)
            .map((item) => normalizeBlogPost(item))
            .filter((item) => item.slug !== loadedPost.slug)
            .slice(0, 3)
        );
      } catch {
        setPost(null);
        setLinkedProducts([]);
        setRecentPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [initialRouteData, notFoundFromSSR, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="text-slate-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Article not found</h1>
          <p className="mt-2 text-sm text-slate-500">The post may be unpublished or the link is incorrect.</p>
          <Link to="/blog" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr),320px]">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {post.category ? <span>{post.category}</span> : null}
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatBlogDate(post.publishedAt || post.createdAt)}</span>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {getReadingTimeLabel(post.content)}</span>
              </div>
              <h1 className="mt-5 text-4xl font-bold text-slate-950 lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                {post.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                {buildBlogExcerpt(post, 220)}
              </p>
              {post.tags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {recentPosts.length > 0 ? (
              <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-semibold text-slate-950">Recent posts</h2>
                <div className="mt-4 space-y-4">
                  {recentPosts.map((item) => (
                    <Link key={item.id} to={`/blog/${item.slug}`} className="block rounded-2xl bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatBlogDate(item.publishedAt || item.createdAt)}</p>
                    </Link>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 lg:px-8 lg:py-14">
        {post.coverImage ? (
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white">
            <img src={post.coverImage} alt={post.title} className="h-[420px] w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr),320px]">
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 lg:p-8">
            <RichContent content={post.content} />
          </article>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Article summary</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{buildBlogExcerpt(post, 160)}</p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Published</p>
                  <p className="mt-1 font-medium text-slate-900">{formatBlogDate(post.publishedAt || post.createdAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Reading time</p>
                  <p className="mt-1 font-medium text-slate-900">{getReadingTimeLabel(post.content)}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {linkedProducts.length > 0 ? (
          <div className="mt-14">
            <div className="mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>Shop This Story</h2>
            </div>
            <ProductsCardAll products={linkedProducts} />
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default BlogPostPage;
