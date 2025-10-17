import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Post {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const allTags = ['all', 'project', 'activity', 'workspace', 'research', 'publication', 'festival'];

const posts: Post[] = [
  {
    id: 1,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1519217651866-847339e674d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMGRlc2t8ZW58MXx8fHwxNzYwMDQxODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['activity', 'publication']
  },
  {
    id: 2,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1654371404345-845d8aa147f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBtb2Rlcm4lMjBidWlsZGluZ3xlbnwxfHx8fDE3NjAwODM5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['research', 'activity']
  },
  {
    id: 3,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1699568542323-ff98aca8ea6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMGNvbG9yZnVsfGVufDF8fHx8MTc2MDAwODUyNnww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['publication']
  },
  {
    id: 4,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1635148040718-acf281233b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBtb3VudGFpbnxlbnwxfHx8fDE3NjAwMDQ4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['project']
  },
  {
    id: 5,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1569396116180-7fe09fa16dd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29kaW5nJTIwc2NyZWVufGVufDF8fHx8MTc2MDA5NDU1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['conference', 'publication']
  },
  {
    id: 6,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1749137011209-3c9127870785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZGVzaWduJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYwMTAzNjM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['activity', 'festival']
  },
  {
    id: 7,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1722689763859-61b3bfae87c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHklMjBzdHlsZWR8ZW58MXx8fHwxNzYwMTAzNjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['publication', 'activity']
  },
  {
    id: 8,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1565560665589-37da0a389949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBjaXR5JTIwc3RyZWV0fGVufDF8fHx8MTc2MDEwMzYzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['conference', 'activity']
  },
  {
    id: 9,
    title: 'Lorem ipsum dolor sit amet.',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1709247505449-2621814603e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGNyZWF0aXZlJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzYwMTAzNjM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['project']
  }
];

export default function App() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('all');

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                       p.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = tag === 'all' || p.tags.includes(tag);
    return matchSearch && matchTag;
  });

  return (
    <div style={{ backgroundColor: '#3c5163', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <img 
          src="http://shamir.lv/wp-content/uploads/2020/03/shamir-logo-white-e1583992710556.png"
          alt="Shamir"
          style={{ height: '240px', marginBottom: '80px' }}
        />
        
        {/* Search */}
        <div className="w-100 px-3" style={{ maxWidth: '600px', marginBottom: '40px' }}>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {allTags.map(t => (
            <button
              key={t}
              className={`btn ${tag === t ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setTag(t)}
              style={{ textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container-fluid px-3 pb-5">
        <div className="row g-2">
          {filtered.map(p => (
            <div key={p.id} className="col-12 col-md-6 col-lg-3">
              <div className="position-relative" style={{ aspectRatio: '1', overflow: 'hidden' }}>
                <img src={p.imageUrl} alt={p.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                
                {/* Title Overlay */}
                <div 
                  className="position-absolute bottom-0 start-0 end-0 p-3"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4), rgba(255,255,255,0.3))'
                  }}
                >
                  <h5 className="text-white m-0">{p.title}</h5>
                </div>

                {/* Hover Description */}
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4 opacity-0 hover-overlay"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6), rgba(255,255,255,0.2))',
                    transition: 'opacity 0.3s'
                  }}
                >
                  <div className="text-center text-white">
                    <h5>{p.title}</h5>
                    <p className="opacity-75">{p.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-5">
            <p className="text-white-50">No posts found matching your criteria.</p>
          </div>
        )}
      </div>

      <style>{`
        .hover-overlay:hover {
          opacity: 1 !important;
        }
        .hover-overlay {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
