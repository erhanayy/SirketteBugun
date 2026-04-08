-- SirketteBugun: Proje Görevleri (Project Tasks) Tablo ve Veritabanı Güncellemesi

-- project_tasks tablosu oluşturuluyor
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    task_status TEXT DEFAULT 'planned' NOT NULL, -- Enum mantığıyla: planned, in_progress, completed, cancelled
    expected_end_date TIMESTAMP,
    end_date TIMESTAMP,
    task_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Foreign Key'ler için indeksler (Performans optimizasyonu için)
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_task_owner_id ON project_tasks(task_owner_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_is_active ON project_tasks(is_active);
