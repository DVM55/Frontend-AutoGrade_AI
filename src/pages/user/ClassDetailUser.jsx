import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassById } from "../../service/class.service";
import ClassMemberUser from "./ClassMemberUser";
import DocumentUser from "./DocumentUser";

const ClassDetailUser = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("students");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await getClassById(classId);
        setClassInfo(res.data);
      } catch (error) {
        console.error("Fetch class detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [classId]);

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (!classInfo)
    return <div className="text-center mt-5">Không tìm thấy lớp</div>;

  const joinLink = `http://localhost:5173/user/join/class/${classInfo.classCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classInfo.classCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const TABS = [
    { key: "students", label: "Thành viên", icon: "bi-people" },
    { key: "exams", label: "Bài kiểm tra", icon: "bi-journal-check" },
    { key: "documents", label: "Tài liệu", icon: "bi-folder2-open" },
  ];

  return (
    <div className="container-fluid px-4 py-3">
      {/* Header */}
      <div className="d-flex align-items-center mb-4 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          style={{ borderRadius: 10 }}
        >
          <i className="bi bi-arrow-left" /> Quay lại
        </button>

        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">{classInfo.title}</h4>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {classInfo.description || "Không có mô tả"}
          </span>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          style={{ borderRadius: 10 }}
          onClick={() => setShowShareModal(true)}
        >
          <i className="bi bi-share-fill" />
          Chia sẻ lớp
        </button>
      </div>

      {/* Tabs */}
      <ul
        className="nav nav-tabs mb-4"
        style={{ borderBottom: "2px solid #e8eaed" }}
      >
        {TABS.map((tab) => (
          <li key={tab.key} className="nav-item">
            <button
              className="nav-link border-0 bg-transparent d-flex align-items-center gap-2 px-4"
              style={{
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? "#1a73e8" : "#5f6368",
                borderBottom:
                  activeTab === tab.key
                    ? "2.5px solid #1a73e8"
                    : "2.5px solid transparent",
                borderRadius: 0,
                paddingBottom: 10,
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`bi ${tab.icon}`} />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div>
        {activeTab === "students" && (
          <ClassMemberUser classId={classInfo?.id} />
        )}

        {activeTab === "exams" && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body text-center text-muted py-5">
              <div style={{ fontSize: 48 }}>📝</div>
              <div className="fw-semibold mt-2">Chưa có bài kiểm tra nào</div>
            </div>
          </div>
        )}

        {activeTab === "documents" && <DocumentUser classId={classInfo?.id} />}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowShareModal(false)}
          />
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: 16 }}
              >
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-share-fill me-2 text-primary" />
                    Chia sẻ lớp học
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowShareModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <p className="text-muted small mb-4">
                    Chia sẻ mã lớp hoặc đường dẫn bên dưới để mời người khác
                    tham gia lớp <strong>{classInfo.title}</strong>.
                  </p>

                  {/* Mã lớp */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small text-uppercase text-secondary">
                      Mã lớp
                    </label>
                    <div className="d-flex gap-2">
                      <div
                        className="flex-grow-1 text-center fw-bold fs-4 text-primary py-2 rounded-2"
                        style={{
                          background: "#f0f4ff",
                          border: "2px dashed #667eea",
                          letterSpacing: "3px",
                        }}
                      >
                        {classInfo.classCode}
                      </div>
                      <button
                        className={`btn ${copiedCode ? "btn-success" : "btn-outline-primary"}`}
                        style={{ borderRadius: 8 }}
                        onClick={handleCopyCode}
                      >
                        {copiedCode ? (
                          <>
                            <i className="bi bi-check2 me-1" />
                            Đã sao chép
                          </>
                        ) : (
                          "Sao chép"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Join Link */}
                  <div>
                    <label className="form-label fw-semibold small text-uppercase text-secondary">
                      Đường dẫn tham gia
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderRadius: "8px 0 0 8px" }}
                        value={joinLink}
                        readOnly
                      />
                      <button
                        className={`btn ${copiedLink ? "btn-success" : "btn-outline-primary"}`}
                        style={{ borderRadius: "0 8px 8px 0" }}
                        onClick={handleCopyLink}
                      >
                        {copiedLink ? (
                          <>
                            <i className="bi bi-check2 me-1" />
                            Đã sao chép
                          </>
                        ) : (
                          "Sao chép"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button
                    className="btn btn-secondary"
                    style={{ borderRadius: 8 }}
                    onClick={() => setShowShareModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassDetailUser;
