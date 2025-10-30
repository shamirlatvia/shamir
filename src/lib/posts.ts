export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  tags: string[];
  publishedAt: string;
  author: string;
}

export function getAllPosts(): BlogPost[] {
  return Object.values(
    import.meta.glob('../posts/*.md', {eager: true})
  ).map((post: any) => {
      const data = post.frontmatter;

      return {
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        content: post.default || "",
        image: data.image,
        tags: data.tags,
        publishedAt: data.publishedAt,
        author: data.author,
      } as BlogPost;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  return Array.from(new Set(posts.flatMap(post => post.tags))).sort();
}

export function getPostById(id: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find(post => post.id === id);
}

// For client-side usage, we'll pass the data from Astro
export function createPostsData(posts: BlogPost[], tags: string[]) {
  return {
    blogPosts: posts,
    allTags: tags,
    getPostById: (id: string) => posts.find(post => post.id === id)
  };
}
