'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { BLOG_POSTS, SERIES_ORDER } from '../../../lib/blog-data';

interface SeriesNavigationProps {
  currentSlug: string;
}

export default function SeriesNavigation({
  currentSlug,
}: SeriesNavigationProps) {
  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === currentSlug);
  if (currentIndex === -1) return null;

  const currentPost = BLOG_POSTS[currentIndex];

  // Find all posts in the same series, sorted by episode
  const seriesPosts = currentPost.series
    ? BLOG_POSTS.filter((p) => p.series === currentPost.series).sort(
        (a, b) => (a.episode || 0) - (b.episode || 0)
      )
    : [];

  const episodeIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);

  let prevPost = null;
  let nextPost = null;

  if (currentPost.series) {
    // 1. Internal Series Navigation
    if (episodeIndex > 0) {
      prevPost = seriesPosts[episodeIndex - 1];
    }
    if (episodeIndex < seriesPosts.length - 1) {
      nextPost = seriesPosts[episodeIndex + 1];
    }

    // 2. Cross-Series Navigation (Boundaries)
    const seriesOrderIndex = SERIES_ORDER.indexOf(currentPost.series);

    if (!prevPost && seriesOrderIndex > 0) {
      const prevSeriesName = SERIES_ORDER[seriesOrderIndex - 1];
      const prevSeriesPosts = BLOG_POSTS.filter(
        (p) => p.series === prevSeriesName
      ).sort((a, b) => (a.episode || 0) - (b.episode || 0));
      prevPost = prevSeriesPosts[prevSeriesPosts.length - 1];
    }

    if (!nextPost && seriesOrderIndex < SERIES_ORDER.length - 1) {
      const nextSeriesName = SERIES_ORDER[seriesOrderIndex + 1];
      const nextSeriesPosts = BLOG_POSTS.filter(
        (p) => p.series === nextSeriesName
      ).sort((a, b) => (a.episode || 0) - (b.episode || 0));
      nextPost = nextSeriesPosts[0];
    }
  } else {
    // Standalone post navigation (by date/index)
    if (currentIndex > 0) nextPost = BLOG_POSTS[currentIndex - 1];
    if (currentIndex < BLOG_POSTS.length - 1)
      prevPost = BLOG_POSTS[currentIndex + 1];
  }

  return (
    <div className="mt-24 pt-12 border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
        {/* Previous Link */}
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.slug}`}
            className="flex-1 group p-6 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-cyber-blue/30 transition-all flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-cyber-blue transition-colors">
              <ArrowLeft className="w-3 h-3" />
              <span>Previous {prevPost.series ? 'Episode' : 'Post'}</span>
            </div>
            <div className="text-sm font-black italic text-white uppercase tracking-tight group-hover:translate-x-1 transition-transform">
              {prevPost.title}
            </div>
            {prevPost.series && (
              <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
                {`${prevPost.series} // EP ${prevPost.episode}`}
              </div>
            )}
          </Link>
        ) : (
          <div className="flex-1 p-6 rounded-3xl border border-white/[0.02] flex flex-col items-start gap-2 opacity-20 grayscale cursor-not-allowed">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>Beginning of Story</span>
            </div>
            <div className="text-sm font-black italic text-white uppercase tracking-tight">
              <span>No Previous Content</span>
            </div>
          </div>
        )}

        <div className="hidden md:flex items-center justify-center px-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <Layers className="w-4 h-4 text-zinc-700" />
          </div>
        </div>

        {/* Next Link */}
        {nextPost ? (
          <Link
            href={`/blog/${nextPost.slug}`}
            className="flex-1 group p-6 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-cyber-blue/30 transition-all flex flex-col items-end text-right gap-2"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-cyber-blue transition-colors">
              <span>Next {nextPost.series ? 'Episode' : 'Post'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="text-sm font-black italic text-white uppercase tracking-tight group-hover:-translate-x-1 transition-transform">
              {nextPost.title}
            </div>
            {nextPost.series && (
              <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
                {`${nextPost.series} // EP ${nextPost.episode}`}
              </div>
            )}
          </Link>
        ) : (
          <Link
            href="/blog"
            className="flex-1 group p-6 rounded-3xl bg-cyber-blue/5 border border-cyber-blue/20 hover:border-cyber-blue transition-all flex flex-col items-end text-right gap-2"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyber-blue uppercase tracking-widest">
              <span>Series Pulse</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="text-sm font-black italic text-white uppercase tracking-tight">
              <span>Back to Index</span>
            </div>
            <div className="text-[8px] font-mono text-cyber-blue/50 uppercase tracking-[0.2em]">
              <span>All Chronology</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
