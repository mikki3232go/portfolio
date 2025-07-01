// src/components/ProductGallery.tsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductRegist from './components/ProductRegist';
import styles from './ProductGallery.module.css';
import { supabase } from './lib/supabase';

// 화살표 아이콘 컴포넌트 정의
const ArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginLeft: 6, marginBottom: 2 }} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7L9 11L13 7" stroke="#232323" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 작품 데이터 인터페이스 정의
interface Product {
  id: number;          // 작품 고유 ID
  grade: number;       // 학년 (1-3)
  title: string;       // 작품 제목
  author: string;      // 작성자
  likes: number;       // 좋아요 수
  views: number;       // 조회수
  imgSrc: string;      // 이미지 URL
  description: string; // 작품 설명
  selfintroLink?: string; // 자기소개 링크 (선택)
  notionLink?: string;    // 노션 링크 (선택)
  deployLink?: string;    // 배포 링크 (선택)
  term?: string;       // 학기
  subject?: string;    // 교과목
  category?: string;   // 범주(대회명)
}

// 학년 목록 (1-3학년)
const grades = [1, 2, 3];
// 학년별 과목 맵
const subjects: { [key: number]: string[] } = {
  1: ['화면구현'],
  2: ['웹프로그래밍', '프론트엔드 기초', '응용프로그래밍개발'],
  
};
//category 목록
//const categories = ['개인프로젝트', '팀프로젝트', '대회명1', '대회명2', '대회명3'];

const ProductGallery: React.FC = () => {
  // 현재 선택된 학년 상태
  const [selectedGrade, setSelectedGrade] = useState(2);
  // 작품 목록 상태
  const [productList, setProductList] = useState<Product[]>([]);
  // 모달 표시 여부 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // 컴포넌트 마운트 시 데이터베이스에서 작품 목록 불러오기
  useEffect(() => {
    fetchProducts();
  }, []);

  // 로그인 상태 확인
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Supabase에서 작품 목록을 가져오는 함수
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('likes', { ascending: false })
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // 데이터베이스 컬럼명을 프론트엔드 인터페이스에 맞게 변환
      const transformedData = data?.map(item => ({
        id: item.id,
        grade: item.grade,
        title: item.title,
        author: item.author,
        likes: item.likes || 0,
        views: item.views || 0,
        imgSrc: item.imgsrc || '',
        description: item.description || '',
        selfintroLink: item.selfintro_link || '',
        notionLink: item.notion_link || '',
        deployLink: item.deploy_link || '',
        term: item.term || '',
        subject: item.subject || '',
        category: item.category || ''
      })) || [];

      setProductList(transformedData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('작품 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 좋아요 처리 함수
  const handleLike = async (id: number) => {
    try {
      // Supabase에서 해당 작품의 좋아요 수 업데이트
      const product = productList.find(p => p.id === id);
      if (!product) return;

      const { error: updateError } = await supabase
        .from('products')
        .update({ likes: product.likes + 1 })
        .eq('id', id);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setProductList(prevList =>
        prevList.map(product =>
          product.id === id ? { ...product, likes: product.likes + 1 } : product
        )
      );
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  // 새 작품 등록 처리 함수
  const handleAddProduct = async (newProduct: Omit<Product, 'id' | 'likes' | 'views'>) => {
    try {
      // Supabase에 새 작품 저장
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            grade: newProduct.grade,
            title: newProduct.title,
            author: newProduct.author,
            imgsrc: newProduct.imgSrc,
            description: newProduct.description,
            selfintro_link: newProduct.selfintroLink,
            notion_link: newProduct.notionLink,
            deploy_link: newProduct.deployLink,
            term: newProduct.term,
            subject: newProduct.subject,
            category: newProduct.category,
            likes: 0,
            views: 0
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 새로 추가된 작품을 목록에 추가
      const transformedProduct: Product = {
        id: data.id,
        grade: data.grade,
        title: data.title,
        author: data.author,
        likes: data.likes || 0,
        views: data.views || 0,
        imgSrc: data.imgsrc || '',
        description: data.description || '',
        selfintroLink: data.selfintro_link || '',
        notionLink: data.notion_link || '',
        deployLink: data.deploy_link || '',
        term: data.term || '',
        subject: data.subject || '',
        category: data.category || ''
      };

      setProductList(prev => [transformedProduct, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  // 구글 로그인 함수
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        작품 목록을 불러오는 중...
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#dc2626'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Hero 영역 */}
      <header className={styles.heroHeader}>
        {/* 상단 네비게이션 바 */}
        <div className={styles.heroTopBar}>
          <div className={styles.heroLogoMenu}>
            <span className={styles.heroLogo}>Bssm Web</span>
            <span className={styles.heroMenuItem}>포트폴리오 <ArrowDown /></span>
            <span className={styles.heroMenuItem}>작품 노션</span>
            <span className={styles.heroMenuItem}>수업활동 <ArrowDown /></span>
          </div>
          {/* 우측 버튼 영역 */}
          <div className={styles.heroRightBtns}>
            <span className={styles.heroSite}>내정보</span>
            {user ? (
              <>
                <span style={{ marginRight: 8 }}>{user.email}</span>
                <button className={styles.heroLoginBtn} onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button className={styles.heroLoginBtn} onClick={handleGoogleLogin}>구글 로그인</button>
            )}
            <button className={styles.heroStartBtn} onClick={() => setIsModalOpen(true)}>작품 등록</button>
          </div>
        </div>

        {/* Hero 센터 영역 */}
        <div className={styles.heroCenter}>
          <div className={styles.heroSubTitle}>자신이 생각한 아이디어를</div>
          <div className={styles.heroTitle}>웹 포트폴리오로 기록해 보세요</div>
          <div className={styles.heroDesc}>아이디어를 웹으로 제안해 보세요</div>
        </div>

        {/* 서브젝트 안내*/}
     
      </header>

      {/* 학년 탭 메뉴 */}
      <div className={styles.tabMenu}>
        {grades.map(grade => (
          <button
            key={grade}
            className={
              selectedGrade === grade
                ? `${styles.tabBtn} ${styles.active}`
                : styles.tabBtn
            }
            onClick={() => {
              setSelectedGrade(grade);
              setSelectedSubject(''); // 학년 변경 시 subject 초기화
            }}
          >
            {grade}학년
          </button>
        ))}
      </div>

      {/* 서브젝트(과목) 탭 메뉴 */}
      <div className={styles.tabMenu}>
        <button
          className={selectedSubject === '' ? `${styles.heroCategoryBtn} ${styles.heroCategoryActive}` : styles.heroCategoryBtn}
          onClick={() => setSelectedSubject('')}
        >
          전체
        </button>
        {subjects[selectedGrade]?.map(subject => (
          <button
            key={subject}
            className={selectedSubject === subject ? `${styles.tabBtn} ${styles.active}` : styles.tabBtn}
            onClick={() => setSelectedSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* 작품 갤러리 그리드 */}
      <div className={styles.galleryGrid}>
        {productList
          .filter(product => product.grade === selectedGrade && (selectedSubject === '' || product.subject === selectedSubject))
          .map(product => (
            <div key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <ProductCard {...product} />
              <div style={{ marginTop: '0.7rem', fontSize: '1rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>작품 소개</div>
                <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{product.author}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontSize: '0.95rem', color: '#444' }}>
                  <button onClick={() => handleLike(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <span role="img" aria-label="like">👍</span>
                  </button> {product.likes}
                  <span role="img" aria-label="view">👁️</span> {product.views}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* 작품 등록 모달 */}
      <ProductRegist
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
        grades={grades}
      />
    </div>
  );
};

export default ProductGallery;
