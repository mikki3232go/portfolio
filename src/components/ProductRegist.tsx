import React, { useState } from 'react';
import styles from '../ProductGallery.module.css';
import { supabase } from '../lib/supabase';

// 작품 데이터 인터페이스
interface Product {
  id: number;
  grade: number;
  title: string;
  author: string;
  likes: number;
  views: number;
  imgSrc: string;
  description: string;
  selfintroLink?: string;
  notionLink?: string;
  deployLink?: string;
  term?: string;      // 학기
  subject?: string;   // 교과목
  category?: string;  // 범주(대회명)
  created_at?: Date;
}

// 모달 props 인터페이스
interface ProductRegistProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'likes' | 'views' | 'created_at'>) => void;
  grades: number[];
}

const ProductRegist: React.FC<ProductRegistProps> = ({
  isOpen,
  onClose,
  onSubmit,
  grades
}) => {
  // 새 작품 입력 폼 상태
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'likes' | 'views'>>({
    grade: 1,
    title: '',
    author: '',
    imgSrc: '',
    description: '',
    selfintroLink: '',
    notionLink: '',
    deployLink: '',
    term: '',
    subject: '',
    category: ''
  });

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  // 에러 메시지
  const [error, setError] = useState<string | null>(null);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Supabase에 데이터 저장
      const {  error: supabaseError } = await supabase
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

      if (supabaseError) throw supabaseError;

      // 부모 컴포넌트에 알림
      onSubmit(newProduct);
      
      // 폼 초기화
      setNewProduct({
        grade: 1,
        title: '',
        author: '',
        imgSrc: '',
        description: '',
        selfintroLink: '',
        notionLink: '',
        deployLink: '',
        term: '',
        subject: '',
        category: ''
      });

      // 모달 닫기
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('작품 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>작품 등록</h2>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* 학년과 학기 선택 (한 라인) */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>학년</label>
              <select 
                value={newProduct.grade} 
                onChange={(e) => setNewProduct(prev => ({ ...prev, grade: Number(e.target.value) }))}
                required
                disabled={isLoading}
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}학년</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>학기</label>
              <select
                value={newProduct.term}
                onChange={(e) => setNewProduct(prev => ({ ...prev, term: e.target.value }))}
                required
                disabled={isLoading}
              >
                <option value="">학기를 선택하세요</option>
                <option value="1학기">1학기</option>
                <option value="2학기">2학기</option>
              </select>
            </div>
          </div>

          {/* 교과목 입력 */}
          <div className={styles.formGroup}>
            <label>교과목</label>
            <input
              type="text"
              value={newProduct.subject}
              onChange={(e) => setNewProduct(prev => ({ ...prev, subject: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          {/* 범주(대회명) 입력 */}
          <div className={styles.formGroup}>
            <label>범주(대회명)</label>
            <input
              type="text"
              value={newProduct.category}
              onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          {/* 제목 입력 */}
          <div className={styles.formGroup}>
            <label>제목</label>
            <input 
              type="text" 
              value={newProduct.title}
              onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          {/* 작성자 입력 */}
          <div className={styles.formGroup}>
            <label>작성자</label>
            <input 
              type="text" 
              value={newProduct.author}
              onChange={(e) => setNewProduct(prev => ({ ...prev, author: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          {/* 이미지 URL 입력 */}
          <div className={styles.formGroup}>
            <label>이미지 URL</label>
            <input 
              type="text" 
              value={newProduct.imgSrc}
              onChange={(e) => setNewProduct(prev => ({ ...prev, imgSrc: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          {/* 설명 입력 */}
          <div className={styles.formGroup}>
            <label>설명</label>
            <textarea 
              value={newProduct.description}
              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          {/* 자기소개 링크 입력 */}
          <div className={styles.formGroup}>
            <label>자기소개 링크</label>
            <input 
              type="text" 
              value={newProduct.selfintroLink}
              onChange={(e) => setNewProduct(prev => ({ ...prev, selfintroLink: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          {/* 노션 링크 입력 */}
          <div className={styles.formGroup}>
            <label>노션 링크</label>
            <input 
              type="text" 
              value={newProduct.notionLink}
              onChange={(e) => setNewProduct(prev => ({ ...prev, notionLink: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          {/* 배포 링크 입력 */}
          <div className={styles.formGroup}>
            <label>배포 링크</label>
            <input 
              type="text" 
              value={newProduct.deployLink}
              onChange={(e) => setNewProduct(prev => ({ ...prev, deployLink: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          {/* 모달 버튼 영역 */}
          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose} disabled={isLoading}>취소</button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductRegist; 