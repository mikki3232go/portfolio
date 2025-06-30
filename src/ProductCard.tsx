import React from 'react';

interface ProductCardProps {
  imgSrc: string;
  title: string;
  description: string;
  deployLink?: string;
  notionLink?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ imgSrc, title, description, deployLink, notionLink }) => {
  // 이미지 클릭 핸들러
  const handleImageClick = () => {
    if (deployLink) {
      window.open(deployLink, '_blank', 'noopener,noreferrer');
    }
  };

  // 설명 클릭 핸들러
  const handleDescriptionClick = () => {
    if (notionLink) {
      window.open(notionLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 320,
    }}>
      <img
        src={imgSrc}
        alt={title}
        style={{ 
          width: '100%', 
          height: 200, 
          objectFit: 'cover', 
          background: '#f5f5f5',
          cursor: deployLink ? 'pointer' : 'default'
        }}
        onClick={handleImageClick}
      />
      <div style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 6 }}>{title}</div>
        <div 
          style={{ color: '#888', fontSize: '0.97rem', minHeight: 32, cursor: notionLink ? 'pointer' : 'default', textDecoration: 'none' }}
          onClick={handleDescriptionClick}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 