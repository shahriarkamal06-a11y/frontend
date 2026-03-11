import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock3, Search, Sparkles, TrendingUp } from 'lucide-react';
import { blogAPI } from '../../services/api';
import { useInitialData } from '../../ssr/initial-data';
import {
  buildBlogExcerpt,
  formatBlogDate,
  getReadingTimeLabel,
  normalizeBlogPost,
} from '../../utils/blog';

const getResponseItems = (response) => response?.data?.data?.items || response?.data?.items || [];

const BlogPage = () => {
  const initialData = useInitialData();
  const initialRouteData = initialData?.routeType === 'blog' ? initialData.routeData : null;
  const [posts, setPosts] = useState(() => initialRouteData?.posts || []);
  const [loading, setLoading] = useState(() => !initialRouteData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (initialRouteData) {
      return;
    }

    const loadPosts = async () => {
      setLoading(true);
      try {
        const response = await blogAPI.getPosts({ page: '1', limit: '50' });
        setPosts(getResponseItems(response).map((post) => normalizeBlogPost(post)));
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [initialRouteData]);

  const categories = useMemo(() => (
    ['All', ...new Set(posts.map((post) => post.category).filter(Boolean))]
  ), [posts]);

  const filteredPosts = useMemo(() => (
    posts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const needle = searchQuery.trim().toLowerCase();
      const matchesSearch = !needle || (
        post.title.toLowerCase().includes(needle)
        || buildBlogExcerpt(post).toLowerCase().includes(needle)
        || post.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
      return matchesCategory && matchesSearch;
    })
  ), [activeCategory, posts, searchQuery]);

  const featuredPosts = filteredPosts.filter((post) => post.featured).slice(0, 2);
  const standardPosts = filteredPosts.filter((post) => !featuredPosts.some((featured) => featured.id === post.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="text-slate-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#1e293b_55%,#0f172a)] py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">
              <Sparkles className="h-4 w-4" />
              Store Journal
            </div>
            <h1 className="text-4xl font-bold text-white lg:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
              Stories, Guides, and Product Picks
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/65">
              Read buying guides, release notes, trend edits, and editorial posts that connect directly to the products you can shop.
            </p>

            <div className="mx-auto mt-10 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search articles..."
                  className="w-full rounded-2xl border border-white/10 bg-white px-12 py-4 text-base text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 lg:px-8 lg:py-16">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {featuredPosts.length > 0 ? (
          <>
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>Featured</h2>
            </div>

            <div className="mb-12 grid gap-6 lg:grid-cols-2">
              {featuredPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                  ) : null}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {post.category ? <span>{post.category}</span> : null}
                      <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                      <span>{getReadingTimeLabel(post.content)}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-slate-950 transition group-hover:text-emerald-700" style={{ fontFamily: 'var(--font-display)' }}>
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{buildBlogExcerpt(post, 180)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>All Posts</h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-950">No posts found</h3>
            <p className="mt-2 text-sm text-slate-500">Try another search or category filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {standardPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                ) : null}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {post.category ? <span>{post.category}</span> : null}
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {getReadingTimeLabel(post.content)}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950 transition group-hover:text-emerald-700">{post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{buildBlogExcerpt(post, 150)}</p>
                  <p className="mt-4 text-xs font-medium text-slate-400">{formatBlogDate(post.publishedAt || post.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BlogPage;
