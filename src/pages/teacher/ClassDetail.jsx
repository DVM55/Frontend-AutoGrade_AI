import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassById } from "../../service/class.service";
import ClassMember from "./ClassMember";
import ClassMemberPending from "./ClassMemberPending";
import Document from "./Document";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("students");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH CLASS =================
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await getClassById(classId);
        console.log("CLASS DETAIL:", res.data);

        setClassInfo(res.data);
      } catch (error) {
        console.error("Fetch class detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId]);

  // ================= LOADING =================
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

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          onClick={() => navigate("/teacher/classes")}
          className="btn btn-outline-secondary me-3"
        >
          <i className="bi bi-arrow-left"></i> Quay lại
        </button>

        <div className="flex-grow-1">
          <h2 className="fw-bold mb-1">{classInfo.title}</h2>
          <p className="text-muted mb-0">
            {classInfo.description || "Không có mô tả"}
          </p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowShareModal(true)}
        >
          <i className="bi bi-share-fill"></i>
          Chia sẻ lớp
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "students" ? "" : "active"}`}
            onClick={() => setActiveTab("students")}
          >
            <i className="bi bi-people me-2"></i>
            Danh sách thành viên
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "approval" ? "" : "active"}`}
            onClick={() => setActiveTab("approval")}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Phê duyệt
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "exams" ? "" : "active"}`}
            onClick={() => setActiveTab("exams")}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Danh sách bài kiểm tra
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "documents" ? "" : "active"}`}
            onClick={() => setActiveTab("documents")}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Tài liệu
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div>
        {activeTab === "students" && <ClassMember classId={classInfo?.id} />}

        {activeTab === "approval" && (
          <ClassMemberPending classId={classInfo?.id} />
        )}

        {activeTab === "exams" && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center text-muted">
              Chưa có bài kiểm tra nào
            </div>
          </div>
        )}

        {activeTab === "documents" && <Document classId={classInfo?.id} />}
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
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-share-fill me-2 text-primary"></i>
                    Chia sẻ lớp học
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowShareModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <p className="text-muted small mb-4">
                    Chia sẻ mã lớp hoặc đường dẫn bên dưới để học sinh tham gia
                    lớp <strong>{classInfo.title}</strong>.
                  </p>

                  {/* Mã lớp */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small text-uppercase">
                      Mã lớp
                    </label>

                    <div className="d-flex gap-2">
                      <div
                        className="flex-grow-1 text-center fw-bold fs-4 text-primary py-2"
                        style={{
                          background: "#f0f4ff",
                          border: "2px dashed #667eea",
                          letterSpacing: "3px",
                        }}
                      >
                        {classInfo.classCode}
                      </div>

                      <button
                        className={`btn ${
                          copiedCode ? "btn-success" : "btn-outline-primary"
                        }`}
                        onClick={handleCopyCode}
                      >
                        {copiedCode ? "Đã sao chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  {/* Join Link */}
                  <div>
                    <label className="form-label fw-semibold small text-uppercase">
                      Đường dẫn tham gia
                    </label>

                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={joinLink}
                        readOnly
                      />
                      <button
                        className={`btn ${
                          copiedLink ? "btn-success" : "btn-outline-primary"
                        }`}
                        onClick={handleCopyLink}
                      >
                        {copiedLink ? "Đã sao chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button
                    className="btn btn-secondary"
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

export default ClassDetail;
